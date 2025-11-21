import express from "express";
import { connectMongo, TikTokVideo } from "./db.js";
import { runParser } from "./parser.js";
import {
  HOT_DELTA_THRESHOLD,
  AUTO_PARSE_INTERVAL_MIN,
  MAX_PARALLEL_PARSERS,
  MOBILE_PROXIES,
} from "./config.js";

import Keyword from "./models/Keyword.js";

const APP_START_TIME = new Date();

export const routerAPI = express.Router();

const parserState = {
  isRunning: false,
  currentKeyword: null,
  lastError: null,
  mode: null,
  queueTotal: 0,
  queueDone: 0,
  lastAutoStart: null,
  lastAutoFinish: null,
};

routerAPI.get("/status", async (req, res) => {
  await connectMongo();
  const totalVideos = await TikTokVideo.countDocuments();

  let nextAutoAt = null;

  if (AUTO_PARSE_INTERVAL_MIN > 0) {
    if (parserState.lastAutoStart) {
      const last = new Date(parserState.lastAutoStart).getTime();
      nextAutoAt = new Date(
        last + AUTO_PARSE_INTERVAL_MIN * 60 * 1000,
      ).toISOString();
    } else {
      const start = APP_START_TIME.getTime();
      nextAutoAt = new Date(
        start + AUTO_PARSE_INTERVAL_MIN * 60 * 1000,
      ).toISOString();
    }
  }

  res.json({
    parser: {
      ...parserState,
      autoIntervalMin: AUTO_PARSE_INTERVAL_MIN,
      nextAutoAt,
    },
    totalVideos,
  });
});

routerAPI.get("/keywords", async (req, res) => {
  await connectMongo();

  const [keywords, stats] = await Promise.all([
    Keyword.find({ enabled: true }).sort({ createdAt: 1 }).lean(),
    TikTokVideo.aggregate([
      {
        $group: {
          _id: "$keyword",
          lastParsedAt: { $max: "$lastParsedAt" },
          videosCount: { $sum: 1 },
          hotCount: {
            $sum: {
              $cond: [
                { $gte: ["$lastDeltaViews", HOT_DELTA_THRESHOLD] },
                1,
                0,
              ],
            },
          },
          newCount: {
            $sum: { $cond: ["$isNewVideo", 1, 0] },
          },
        },
      },
    ]),
  ]);

  const statMap = new Map(stats.map((s) => [s._id, s]));

  const result = keywords.map((k) => {
    const s = statMap.get(k.keyword);
    return {
      keyword: k.keyword,
      lastParsedAt: s?.lastParsedAt || null,
      videosCount: s?.videosCount || 0,
      hotCount: s?.hotCount || 0,
      newCount: s?.newCount || 0,
    };
  });

  res.json(result);
});

routerAPI.get("/videos", async (req, res) => {
  await connectMongo();

  const {
    keyword,
    keywords,
    page = 1,
    limit = 50,
    sort = "delta",
    onlyNew,
    onlyHot,
  } = req.query;

  const filter = {};

  if (keywords) {
    const list = String(keywords)
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    if (list.length === 1) {
      filter.keyword = list[0];
    } else if (list.length > 1) {
      filter.keyword = { $in: list };
    }
  } else if (keyword) {
    filter.keyword = keyword;
  }

  const isOnlyNew = onlyNew === "1" || onlyNew === "true";
  const isOnlyHot = onlyHot === "1" || onlyHot === "true";

  if (isOnlyNew) filter.isNewVideo = true;
  if (isOnlyHot) filter.isHot = true;

  const sortObj =
    sort === "views"
      ? { views: -1 }
      : sort === "created"
        ? { firstParsedAt: -1 }
        : { lastDeltaViews: -1 };

  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 50;
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    TikTokVideo.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    TikTokVideo.countDocuments(filter),
  ]);

  res.json({ items, total, page: pageNum });
});

routerAPI.post("/parse", async (req, res) => {
  let { keyword } = req.body || {};
  if (!keyword) {
    return res.status(400).json({ error: "keyword required" });
  }

  keyword = String(keyword).trim();
  if (!keyword) {
    return res.status(400).json({ error: "keyword required" });
  }

  await connectMongo();

  await Keyword.updateOne(
    { keyword },
    { $setOnInsert: { enabled: true } },
    { upsert: true },
  );

  if (parserState.isRunning) {
    return res
      .status(400)
      .json({ error: "Парсер уже запущен (авто или ручной)" });
  }

  try {
    parserState.isRunning = true;
    parserState.mode = "manual";
    parserState.currentKeyword = keyword;
    parserState.lastError = null;
    parserState.queueTotal = 1;
    parserState.queueDone = 0;

    const report = await runParser(keyword);

    parserState.queueDone = 1;
    parserState.isRunning = false;
    parserState.mode = null;
    parserState.currentKeyword = null;

    res.json(report);
  } catch (err) {
    parserState.isRunning = false;
    parserState.mode = null;
    parserState.currentKeyword = null;
    parserState.lastError = String(err);

    res.status(500).json({ error: String(err) });
  }
});

async function autoParseAllKeywords() {
  if (parserState.isRunning) {
    console.log("Автопарсинг пропущен — уже идёт парсер");
    return;
  }

  await connectMongo();

  const keywords = await Keyword.find({ enabled: true })
    .sort({ createdAt: 1 })
    .lean();

  if (!keywords.length) {
    console.log("В базе нет enabled keywords — автопарсинг пропущен");
    return;
  }

  if (!MOBILE_PROXIES.length) {
    console.log("Нет MOBILE_PROXIES — автопарсинг отменён");
    return;
  }

  parserState.isRunning = true;
  parserState.mode = "auto";
  parserState.queueTotal = keywords.length;
  parserState.queueDone = 0;
  parserState.lastError = null;
  parserState.lastAutoStart = new Date();
  parserState.lastAutoFinish = null;

  const proxies = MOBILE_PROXIES;
  const proxyCount = proxies.length;

  console.log(
    `Автопарсинг: ${keywords.length} ключевых слов, прокси: ${proxyCount}`,
  );

  const tasks = proxies.map((proxyConfig, proxyIdx) => {
    const myKeywords = keywords.filter(
      (_, idx) => idx % proxyCount === proxyIdx,
    );

    if (!myKeywords.length) return Promise.resolve();

    return (async () => {
      console.log(
        `Воркер #${proxyIdx + 1} (${proxyConfig.label}) получил ${myKeywords.length} ключевых слов`,
      );

      const parallelTasks = myKeywords.map((k) => {
        const kw = k.keyword;

        console.log(
          `[AUTO][${proxyConfig.label}] Парсим "${kw}"`,
        );

        return runParser(kw, { proxy: proxyConfig })
          .catch((err) => {
            console.error(
              `Ошибка автопарсинга "${kw}" на ${proxyConfig.label}:`,
              err,
            );
            parserState.lastError = String(err);
          })
          .finally(() => {
            parserState.queueDone += 1;
          });
      });

      await Promise.allSettled(parallelTasks);
    })();
  });

  await Promise.allSettled(tasks);

  parserState.isRunning = false;
  parserState.mode = null;
  parserState.currentKeyword = null;
  parserState.lastAutoFinish = new Date();

  console.log("Автопарсинг завершён");
}

if (AUTO_PARSE_INTERVAL_MIN > 0) {
  console.log(
    `Автопарсинг включен: каждые ${AUTO_PARSE_INTERVAL_MIN} минут`,
  );
  setInterval(
    autoParseAllKeywords,
    AUTO_PARSE_INTERVAL_MIN * 60 * 1000,
  );
}

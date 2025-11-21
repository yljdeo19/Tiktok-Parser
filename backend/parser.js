import puppeteer from "puppeteer";
import { connectMongo, TikTokVideo } from "./db.js";
import { mapItems, sleep, smartScroll } from "./helpers.js";
import {
  MOBILE_PROXIES,
  HOT_DELTA_THRESHOLD,
  SCROLL_STEPS,
} from "./config.js";

let proxyIndex = 0;
import { getViralScore } from "./viral.js";


export async function runParser(keyword, options = {}) {
  await connectMongo();

  let proxy = null;
  let scrollSteps = SCROLL_STEPS;

  if (typeof options === "number") {

    scrollSteps = options;
  } else if (options && typeof options === "object") {
    if (options.scrollSteps) scrollSteps = options.scrollSteps;
    if (options.proxy) proxy = options.proxy;
  }


  if (!proxy) {
    if (!MOBILE_PROXIES.length) {
      throw new Error("Нет MOBILE_PROXIES в config.js");
    }
    proxy = MOBILE_PROXIES[proxyIndex % MOBILE_PROXIES.length];
    proxyIndex++;
  }

  console.log(`🚀 Парсим "${keyword}" через ${proxy.label}`);

  const PROXY_URL = `http://${proxy.host}:${proxy.port}`;

  const browser = await puppeteer.launch({
    headless: true,
    args: [`--proxy-server=${PROXY_URL}`],
  });

  const page = await browser.newPage();

  if (proxy.user && proxy.pass) {
    await page.authenticate({
      username: proxy.user,
      password: proxy.pass,
    });
  }

  const API_RESPONSES = [];
  const seenUrls = new Set();
  let stopScrolling = false;

  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (["image", "media", "font"].includes(req.resourceType())) {
      req.abort();
    } else req.continue();
  });

  page.on("response", async (res) => {
    const url = res.url();
    if (!url.includes("/api/search/general/full")) return;

    if (seenUrls.has(url)) return;
    seenUrls.add(url);

    try {
      const data = await res.json();
      const items = mapItems(data);

      API_RESPONSES.push(items);

      if (API_RESPONSES.length >= 20) stopScrolling = true;
    } catch {}
  });

  const searchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(
    keyword,
  )}`;

  await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 0 });

  try {
    await page.waitForSelector('[data-e2e="search_video-item"]', {
      timeout: 20000,
    });
  } catch {
    console.log("⚠️ Видео не нашли, всё равно начинаем скролл");
  }

  await smartScroll(
    page,
    { steps: scrollSteps, delay: 800 },
    () => stopScrolling,
  );

  await sleep(5000);

  await browser.close();

  const all = API_RESPONSES.flat();

  return await saveToDb(keyword, all);
}

async function saveToDb(keyword, items) {
  await TikTokVideo.updateMany(
    { keyword },
    { $set: { isNewVideo: false } },
  );

  const ids = items.map((v) => v.id);
  const prevDocs = await TikTokVideo.find({ id: { $in: ids }, keyword }).lean();

  const prevMap = new Map(prevDocs.map((d) => [d.id, d]));

  const updates = [];


  for (const item of items) {
    const prev = prevMap.get(item.id);

    let views = item.views || 0;
    let prevViews = prev ? prev.views || 0 : 0;

    const isNew = !prev;
    let delta = 0;

    if (!isNew) {
      delta = Math.max(views - prevViews, 0);
    } else {
      prevViews = views;
      delta = 0;
    }

    const isHot = !isNew && delta >= HOT_DELTA_THRESHOLD; 
    const viralInfo = getViralScore({
  views,
  prevViews,
  lastDeltaViews: delta,
  isNewVideo: isNew,
  isAd: item.isAd
});
console.log("VIRAL CHECK:", item.id, viralInfo);

    updates.push({
      updateOne: {
        filter: { id: item.id, keyword },
        update: {
          $set: {
            ...item,
            keyword,
            views,
            prevViews,
            lastDeltaViews: delta,
            isNewVideo: isNew,
            isHot,
            lastParsedAt: new Date(),
          },
          $setOnInsert: { firstParsedAt: new Date() },
        },
        upsert: true,
      },
    });
  }

  if (updates.length) {
    await TikTokVideo.bulkWrite(updates);
  }

  return {
    total: items.length,
    saved: updates.length,
    newVideos: updates.filter((u) => u.updateOne.update.$set.isNewVideo).length,
    hot: updates.filter(
      (u) => u.updateOne.update.$set.lastDeltaViews >= HOT_DELTA_THRESHOLD,
    ).length,
  };
}

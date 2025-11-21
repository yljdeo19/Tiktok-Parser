export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getCoverUrl(video = {}) {
  const candidates = [];

  if (typeof video.cover === "string") candidates.push(video.cover);
  if (typeof video.originCover === "string") candidates.push(video.originCover);

  if (video.cover?.urlList) candidates.push(...video.cover.urlList);
  if (video.cover?.url_list) candidates.push(...video.cover.url_list);

  for (const url of candidates) {
    if (typeof url === "string" && url.startsWith("http")) {
      return url;
    }
  }

  return "";
}

export function mapItems(raw) {
  const list = raw?.data ?? [];

  return list
    .filter((entry) => entry?.type === 1 && entry?.item)
    .map((entry) => {
      const item = entry.item;
      const author = item.author ?? {};
      const stats = item.stats ?? {};
      const video = item.video ?? {};

      const videoId = item.id;

      return {
        id: videoId,
        desc: item.desc ?? "",
        authorUniqueId: author.uniqueId ?? "",
        authorNickname: author.nickname ?? "",
        videoUrl: `https://www.tiktok.com/@${author.uniqueId}/video/${videoId}`,
        playUrl: video.playAddr ?? "",
        cover: getCoverUrl(video),
        likes: stats.diggCount ?? 0,
        comments: stats.commentCount ?? 0,
        shares: stats.shareCount ?? 0,
        views: stats.playCount ?? 0,
        isAd: item.isAd === true,
      };
    });
}

export async function smartScroll(page, { steps = 60, delay = 800 } = {}, shouldStop) {
  for (let i = 0; i < steps; i++) {
    if (shouldStop?.()) break;
    if (page.isClosed?.()) break;

    try {
      await page.evaluate(() => {
        const el =
          document.scrollingElement ||
          document.documentElement ||
          document.body;
        el.scrollBy(0, window.innerHeight * 2);
      });
    } catch (err) {
      const m = String(err.message || err);
      if (
        m.includes("Execution context was destroyed") ||
        m.includes("detached frame")
      ) {
        console.log("⚠️ Detached frame → stopping scroll");
        break;
      }
      throw err;
    }

    await sleep(delay);
  }
}

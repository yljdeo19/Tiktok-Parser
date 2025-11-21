const AUTO_INTERVAL_MIN = 180; 
const HOURS = AUTO_INTERVAL_MIN / 60;

export function getViralScore(video) {
  const {
    views = 0,
    prevViews = 0,
    lastDeltaViews: delta = 0,
    isNewVideo = false,
    isAd = false,
  } = video || {};


  if (isAd) {
    return {
      score: 0,
      label: "ignored",
      reasons: ["Рекламное видео"],
    };
  }

  const reasons = [];
  let score = 0;


  if (delta > 0) {
    score += delta * 0.01; 
    reasons.push(`Δ просмотров: +${delta}`);
  } else {
    reasons.push("Нет роста за последние 3 часа");
  }


  const deltaPerHour = delta / HOURS;
  if (deltaPerHour > 0) {
    score += deltaPerHour * 0.02;
    reasons.push(`Рост в час: ${Math.round(deltaPerHour)}`);
  }


  if (isNewVideo && delta > 0) {
    score += 10;
    reasons.push("Новый ролик с ростом");
  }


  if (views > 2_000_000 && delta === 0) {
    reasons.push("Популярное, но не виральное");
  }

  let label = "weak";

  if (delta > 50_000) label = "viral";
  else if (delta > 10_000) label = "strong";
  else if (delta > 2_000) label = "medium";
  else if (delta > 300) label = "weak";
  else label = "ignored";

  return {
    score: Math.round(score),
    label,
    reasons,
  };
}

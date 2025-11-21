export const KEYWORDS = [
  "fyp",
  "kaspi",
  "halyk",
  "almaty",
];

export const MOBILE_PROXIES = [
  {
    label: "Proxy #1",
    host: "host",
    port: port,
    user: "user",
    pass: "pass",
  },
{
    label: "Proxy #2",
    host: "host",
    port: port,
    user: "user",
    pass: "pass",
  },
  {
    label: "Proxy #3",
    host: "host",
    port: port,
    user: "user",
    pass: "pass",
  },
];

export const SCROLL_STEPS = 50;



export const HOT_DELTA_THRESHOLD = 50000;

export const AUTO_PARSE_INTERVAL_MIN = Number(
  process.env.AUTO_PARSE_INTERVAL_MIN || 15,
);

export const MAX_PARALLEL_PARSERS = Number(
  Number(process.env.MAX_PARALLEL_PARSERS) || MOBILE_PROXIES.length,
);

// src/types/tiktok.ts

export type ParserState = {
  isRunning: boolean;
  currentKeyword: string | null;
  lastError: string | null;

  mode?: "auto" | "manual" | null;
  queueTotal?: number;
  queueDone?: number;

  lastAutoStart?: string | null;
  lastAutoFinish?: string | null;

  autoIntervalMin?: number;
  nextAutoAt?: string | null;
};

export type StatusResponse = {
  parser: ParserState;
  totalVideos: number;
};

export type KeywordStat = {
  keyword: string;
  lastParsedAt?: string;
  videosCount: number;
  hotCount: number;
  newCount: number;
};

export type VideoItem = {
  _id: string;
  keyword: string;
  desc: string;
  authorUniqueId: string;
  authorNickname: string;
  videoUrl: string;
  views: number;
  prevViews: number;
  lastDeltaViews: number;
  isHot?: boolean;
  isNewVideo?: boolean;
  firstParsedAt?: string;
  lastParsedAt?: string;
};

export type VideosResponse = {
  items: VideoItem[];
  total: number;
  page: number;
};

export type VideoSort = "delta" | "views" | "created";

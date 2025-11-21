// src/components/StatusCard.tsx
"use client";

import type { StatusResponse } from "@/types/tiktok";

type Props = {
  status: StatusResponse | null;
  loading: boolean;
  onRefresh: () => void;
};

export default function StatusCard({ status, loading, onRefresh }: Props) {
  if (!status) {
    return (
      <section className="bg-white rounded-lg p-4 shadow-sm">
        <div className="text-sm text-slate-500">
          {loading ? "Загружаем состояние бота..." : "Нет данных о боте"}
        </div>
      </section>
    );
  }

  const parser = status.parser;
  const queueTotal = parser.queueTotal ?? 0;
  const queueDone = parser.queueDone ?? 0;
  const progress =
    queueTotal > 0 ? Math.round((queueDone * 100) / queueTotal) : 0;

  const isRunning = parser.isRunning;
  const modeLabel =
    parser.mode === "auto"
      ? "Бот сам проходит по всем словам"
      : parser.mode === "manual"
      ? "Ручной запуск по одному слову"
      : "Бот сейчас отдыхает";

  const videosCount = status.totalVideos;

  return (
    <section className="bg-white rounded-lg p-4 shadow-sm space-y-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              Что сейчас делает бот
            </span>
            {isRunning ? (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <span className="mr-1 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Бот ищет ролики…
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                <span className="mr-1 h-2 w-2 rounded-full bg-slate-400" />
                Бот ждёт команды
              </span>
            )}
          </div>

          <div className="text-xs text-slate-500">
            Режим работы: <span className="font-semibold">{modeLabel}</span>
          </div>

          <div className="text-xs text-slate-500">
            Видео в нашей базе:{" "}
            <span className="font-semibold">
              {videosCount.toLocaleString("ru-RU")}
            </span>
          </div>

          {parser.autoIntervalMin && (
            <div className="text-xs text-slate-500">
              Автозапуск: примерно раз в{" "}
              <span className="font-semibold">
                {parser.autoIntervalMin} минут
              </span>
            </div>
          )}

          {parser.nextAutoAt && (
            <div className="text-xs text-slate-500">
              Следующий автопоиск ~{" "}
              {new Date(parser.nextAutoAt).toLocaleTimeString("ru-RU")}
            </div>
          )}

          {parser.lastError && (
            <div className="text-xs text-red-500">
              Последняя ошибка бота: {parser.lastError}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="self-start mt-2 inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? "Обновляем…" : "Обновить статус"}
        </button>
      </div>

      {isRunning && queueTotal > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>
              Обрабатываем слова: {queueDone} из {queueTotal}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </section>
  );
}

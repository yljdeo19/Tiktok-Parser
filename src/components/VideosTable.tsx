// src/components/VideosTable.tsx
"use client";

import type { VideoItem } from "@/types/tiktok";
import type { VideoSort } from "@/hooks/useVideos";
import Pagination from "@/components/Pagination";

type Props = {
  videos: VideoItem[];
  loading: boolean;
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;

  sort: VideoSort;
  onSortChange: (sort: VideoSort) => void;
  onlyNew: boolean;
  onlyHot: boolean;
  onToggleOnlyNew: () => void;
  onToggleOnlyHot: () => void;


  allKeywords: string[];
  keywordFilter: string;
  onKeywordFilterChange: (kw: string) => void;
};

export default function VideosTable({
  videos,
  loading,
  total,
  page,
  totalPages,
  onPageChange,
  sort,
  onSortChange,
  onlyNew,
  onlyHot,
  onToggleOnlyNew,
  onToggleOnlyHot,
  allKeywords,
  keywordFilter,
  onKeywordFilterChange,
}: Props) {
  const sortLabel =
    sort === "views"
      ? "Сначала самые популярные ролики"
      : sort === "created"
      ? "Сначала те, что мы нашли недавно"
      : "Сначала те, у которых сильнее всего выросли просмотры";

  const titleSuffix = keywordFilter
    ? `по слову "${keywordFilter}"`
    : "по всем сохранённым словам";

  return (
    <section className="bg-white rounded-lg p-4 shadow-sm space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Ролики {titleSuffix}
          </h2>
          <div className="text-xs text-slate-500">{sortLabel}</div>
          <div className="mt-1 text-[11px] text-slate-400">
            🌶 <span className="font-semibold">HOT</span> — ролики с большим
            ростом просмотров. 🆕 <span className="font-semibold">NEW</span> —
            ролики, которые бот только что нашёл.
          </div>
        </div>

        <div className="flex flex-col gap-2 items-start md:items-end text-xs">

          <div className="flex flex-wrap gap-2 items-center justify-end">
            <span className="text-slate-500">Ключевое слово:</span>
            <select
              value={keywordFilter}
              onChange={(e) => onKeywordFilterChange(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Все слова</option>
              {allKeywords.map((kw) => (
                <option key={kw} value={kw}>
                  {kw}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <button
              type="button"
              onClick={() => onSortChange("delta")}
              className={`rounded-full px-3 py-1 border ${
                sort === "delta"
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "bg-white border-slate-200 text-slate-700"
              }`}
            >
              Рост просмотров
            </button>
            <button
              type="button"
              onClick={() => onSortChange("views")}
              className={`rounded-full px-3 py-1 border ${
                sort === "views"
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "bg-white border-slate-200 text-slate-700"
              }`}
            >
              Больше всего просмотров
            </button>
            <button
              type="button"
              onClick={() => onSortChange("created")}
              className={`rounded-full px-3 py-1 border ${
                sort === "created"
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "bg-white border-slate-200 text-slate-700"
              }`}
            >
              Сначала новенькие
            </button>

            <button
              type="button"
              onClick={onToggleOnlyNew}
              className={`rounded-full px-3 py-1 border ${
                onlyNew
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "bg-white border-slate-200 text-slate-700"
              }`}
            >
              Только NEW
            </button>
            <button
              type="button"
              onClick={onToggleOnlyHot}
              className={`rounded-full px-3 py-1 border ${
                onlyHot
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "bg-white border-slate-200 text-slate-700"
              }`}
            >
              Только HOT
            </button>
          </div>
        </div>
      </div>


      {loading ? (
        <div className="text-sm text-slate-400">Ищем ролики…</div>
      ) : videos.length === 0 ? (
        <div className="text-sm text-slate-400">
          Для выбранного слова пока нет роликов (с учётом фильтров).
        </div>
      ) : (
        <>
          <div className="overflow-x-auto text-sm">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100">
                  <th className="py-1 pr-2 text-left">Описание</th>
                  <th className="py-1 px-2 text-left">Автор</th>
                  <th className="py-1 px-2 text-right">Просмотры сейчас</th>
                  <th className="py-1 px-2 text-right">Было</th>
                  <th className="py-1 px-2 text-right">Стало больше на</th>
                  <th className="py-1 pl-2 text-left">Метки</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((v) => {
                  const delta = v.lastDeltaViews || 0;
                  const deltaCls =
                    delta >= 50000
                      ? "text-rose-500 font-semibold"
                      : delta > 0
                      ? "text-emerald-600"
                      : "text-slate-400";

                  return (
                    <tr
                      key={v._id}
                      className="border-b border-slate-50 hover:bg-slate-50"
                    >
                      <td className="py-1 pr-2 max-w-[260px]">
                        <a
                          href={v.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline text-emerald-600"
                        >
                          {v.desc || "(без описания)"}
                        </a>
                      </td>
                      <td className="py-1 px-2">
                        @{v.authorUniqueId}
                        <span className="text-slate-400">
                          {" "}
                          ({v.authorNickname})
                        </span>
                      </td>
                      <td className="py-1 px-2 text-right">
                        {v.views?.toLocaleString("ru-RU") ?? 0}
                      </td>
                      <td className="py-1 px-2 text-right">
                        {v.prevViews?.toLocaleString("ru-RU") ?? 0}
                      </td>
                      <td className={`py-1 px-2 text-right ${deltaCls}`}>
                        +{delta.toLocaleString("ru-RU")}
                      </td>
                      <td className="py-1 pl-2">
                        <div className="flex flex-wrap gap-1 text-[10px]">
                          {v.isHot && (
                            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-rose-600">
                              HOT
                            </span>
                          )}
                          {v.isNewVideo && (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-600">
                              NEW
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="text-xs text-slate-500">
            Всего роликов: {total.toLocaleString("ru-RU")}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={onPageChange}
          />
        </>
      )}
    </section>
  );
}

// src/components/KeywordsTable.tsx
"use client";

import type { KeywordStat } from "@/types/tiktok";

type Props = {
  keywords: KeywordStat[];
  loading: boolean;
  selectedKeyword: string;
  onSelectKeyword: (kw: string) => void;
};

export default function KeywordsTable({
  keywords,
  loading,
  selectedKeyword,
  onSelectKeyword,
}: Props) {
  return (
    <section className="bg-white rounded-lg p-4 shadow-sm space-y-3 h-full flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">
          Сохранённые слова
        </h2>
        <div className="text-[11px] text-slate-400 text-right">
          Нажмите на слово — ниже покажем ролики по нему.
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-slate-400">Загружаем список слов…</div>
      ) : keywords.length === 0 ? (
        <div className="text-sm text-slate-400">
          Пока нет сохранённых слов. Введите слово выше и запустите поиск — мы
          запомним его здесь.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto text-xs flex-1">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100">
                  <th className="py-1 pr-2 text-left">Слово</th>
                  <th className="py-1 px-2 text-right">Роликов</th>
                  <th className="py-1 px-2 text-right">Сильный рост</th>
                  <th className="py-1 px-2 text-right">Новые</th>
                  <th className="py-1 pl-2 text-left">Когда последний раз искали</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((k) => {
                  const isActive = k.keyword === selectedKeyword;
                  return (
                    <tr
                      key={k.keyword}
                      onClick={() => onSelectKeyword(k.keyword)}
                      className={`cursor-pointer border-b border-slate-50 hover:bg-emerald-50/40 ${
                        isActive ? "bg-emerald-50/70" : ""
                      }`}
                    >
                      <td className="py-1 pr-2 font-medium text-slate-800">
                        {k.keyword}
                      </td>
                      <td className="py-1 px-2 text-right text-slate-700">
                        {k.videosCount}
                      </td>
                      <td className="py-1 px-2 text-right text-rose-500">
                        {k.hotCount}
                      </td>
                      <td className="py-1 px-2 text-right text-emerald-600">
                        {k.newCount}
                      </td>
                      <td className="py-1 pl-2 text-slate-500">
                        {k.lastParsedAt
                          ? new Date(k.lastParsedAt).toLocaleString("ru-RU")
                          : "ещё не искали"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-slate-400">
            🌶 <span className="font-semibold">Сильный рост</span> — ролики,
            где просмотры сильно подскочили. 🆕{" "}
            <span className="font-semibold">Новые</span> — только что найденные
            ролики.
          </div>
        </>
      )}
    </section>
  );
}

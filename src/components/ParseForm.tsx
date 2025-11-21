"use client";

import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API || "/api";

type Props = {
  initialKeyword?: string;
  isParserRunning: boolean;
  onParsed?: () => void;
};

export default function ParseForm({
  initialKeyword,
  isParserRunning,
  onParsed,
}: Props) {
  const [keyword, setKeyword] = useState(initialKeyword || "");
  const [isParsing, setIsParsing] = useState(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    setKeyword(initialKeyword || "");
  }, [initialKeyword]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim()) return;

    try {
      setIsParsing(true);
      setMessage("");

      const res = await fetch(`${API_BASE}/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Ошибка запуска поиска");
      }

      const data = await res.json();
      setMessage(
        `Готово. Нашли ${data.total} роликов. Новые: ${data.newVideos}, с сильным ростом: ${data.hot}.`,
      );

      onParsed && onParsed();
    } catch (err: any) {
      console.error(err);
      setMessage(err.message || "Ошибка");
    } finally {
      setIsParsing(false);
    }
  }

  const buttonText = isParsing || isParserRunning ? "Бот ищет…" : "Запустить поиск";

  return (
    <section className="bg-white rounded-lg p-4 shadow-sm space-y-3">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 md:flex-row md:items-end"
      >
        <div className="flex-1">
          <label className="block text-xs text-slate-500 mb-1">
            Что искать в TikTok
          </label>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            placeholder="например: kaspi, смешные коты, рецепты, казахстан..."
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Впервые видим это слово — добавим его справа в список сохранённых
            слов.
          </p>
        </div>
        <button
          type="submit"
          disabled={isParsing || isParserRunning}
          className="w-full md:w-[220px] mb-5 justify-self-end rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {buttonText}
        </button>
      </form>

      {message && (
        <div className="mt-1 text-xs text-slate-700 whitespace-pre-line">
          {message}
        </div>
      )}
    </section>
  );
}

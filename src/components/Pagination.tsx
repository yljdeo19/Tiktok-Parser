// src/components/Pagination.tsx
"use client";

type Props = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

export default function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
      <div>
        Страница{" "}
        <span className="font-semibold text-slate-800">{page}</span> из{" "}
        <span className="font-semibold text-slate-800">{totalPages}</span>
      </div>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onChange(Math.max(page - 1, 1))}
          className="rounded-full border border-slate-200 bg-white px-3 py-1 disabled:opacity-40 text-xs font-medium hover:bg-slate-50 transition"
        >
          Назад
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => onChange(Math.min(page + 1, totalPages))}
          className="rounded-full border border-slate-200 bg-white px-3 py-1 disabled:opacity-40 text-xs font-medium hover:bg-slate-50 transition"
        >
          Вперёд
        </button>
      </div>
    </div>
  );
}

"use client";

import { Hint } from "@/lib/types";

interface HintCardProps {
  hint: Hint;
  index: number;
  revealed: boolean;
  isNext: boolean;
  gameOver: boolean;
  onReveal: () => void;
}

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: "bg-green-500/20 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  hard: "bg-red-500/20 text-red-400 border-red-500/30",
};

const CARD_NUMBER_LABELS = ["1st", "2nd", "3rd", "4th"];

export default function HintCard({
  hint,
  index,
  revealed,
  isNext,
  gameOver,
  onReveal,
}: HintCardProps) {
  const difficulty = hint["hint-type"];
  const statement = hint["hint-statement"];
  const diffStyle = DIFFICULTY_STYLES[difficulty] ?? DIFFICULTY_STYLES.medium;
  const isClickable = isNext && !gameOver;

  return (
    <div
      onClick={isClickable ? onReveal : undefined}
      className={`
        relative rounded-xl border p-4 transition-all duration-300 select-none
        ${
          revealed
            ? "bg-slate-800 border-slate-700"
            : isClickable
              ? "bg-slate-800/60 border-slate-600 cursor-pointer hover:border-green-500/60 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.99]"
              : "bg-slate-900/40 border-slate-800 opacity-50"
        }
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium text-slate-500 shrink-0 mt-0.5">
          #{CARD_NUMBER_LABELS[index]}
        </span>

        {revealed ? (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0 ${diffStyle}`}
          >
            {difficulty}
          </span>
        ) : (
          <span className="text-xs text-slate-600 shrink-0">
            {isClickable ? "tap to reveal" : "locked"}
          </span>
        )}
      </div>

      <div className="mt-3 min-h-[48px] flex items-center">
        {revealed ? (
          <p className="text-slate-200 text-sm leading-relaxed animate-fadeIn">
            {statement}
          </p>
        ) : (
          <div className="flex items-center gap-2 text-slate-600">
            <span className="text-xl">{isClickable ? "🔓" : "🔒"}</span>
            {isClickable && (
              <span className="text-xs text-slate-500">
                Click to reveal hint
              </span>
            )}
          </div>
        )}
      </div>

      {!revealed && isClickable && (
        <div className="absolute inset-0 rounded-xl ring-1 ring-green-500/20 pointer-events-none" />
      )}
    </div>
  );
}

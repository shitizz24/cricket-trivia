"use client";

import { useState } from "react";
import { Hint } from "@/lib/types";

interface ResultScreenProps {
  won: boolean;
  correctName: string;
  stars: number;
  hints: Hint[];
  revealedCount: number;
  wrongGuesses: number;
  onNewGame: () => void;
}

const HINT_EMOJIS = ["🟢", "🟡", "🟠", "🔴"];

export default function ResultScreen({
  won,
  correctName,
  stars,
  hints,
  revealedCount,
  wrongGuesses,
  onNewGame,
}: ResultScreenProps) {
  const [copied, setCopied] = useState(false);

  const shareText = [
    `Cricket Trivia ${won ? "✅" : "❌"}`,
    `${correctName}`,
    `⭐ ${stars} stars | ${revealedCount} hint${revealedCount !== 1 ? "s" : ""} used | ${wrongGuesses} wrong guess${wrongGuesses !== 1 ? "es" : ""}`,
    "",
    hints
      .map((h, i) => (i < revealedCount ? HINT_EMOJIS[i] : "⬛"))
      .join(" "),
  ].join("\n");

  const handleShare = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        {/* Result header */}
        <div className="text-center mb-5">
          <div className="text-5xl mb-3">{won ? "🏆" : "💔"}</div>
          <h2 className="text-xl font-bold text-white">
            {won ? "Well played!" : "Better luck next time!"}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            The answer was{" "}
            <span className="text-green-400 font-semibold">{correctName}</span>
          </p>
        </div>

        {/* Score summary */}
        <div className="flex items-center justify-center gap-6 mb-5 py-4 bg-slate-800/60 rounded-xl">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">⭐ {stars}</p>
            <p className="text-xs text-slate-500 mt-0.5">final score</p>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-200">{revealedCount}/4</p>
            <p className="text-xs text-slate-500 mt-0.5">hints used</p>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-200">{wrongGuesses}</p>
            <p className="text-xs text-slate-500 mt-0.5">wrong guesses</p>
          </div>
        </div>

        {/* All hints revealed */}
        <div className="space-y-2 mb-5">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-medium mb-2">
            All hints
          </p>
          {hints.map((hint, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-sm shrink-0 mt-0.5">{HINT_EMOJIS[i]}</span>
              <p className="text-sm text-slate-300 leading-snug">
                {hint["hint-statementt"]}
              </p>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2.5">
          <button
            onClick={handleShare}
            className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors"
          >
            {copied ? "Copied! ✓" : "Share Results"}
          </button>
          <button
            onClick={onNewGame}
            className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-white text-sm font-bold transition-colors"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}

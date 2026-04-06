"use client";

import { useEffect, useState } from "react";

interface ChoiceGridProps {
  choices: string[];
  correctName: string;
  onGuess: (name: string) => void;
  disabled: boolean;
  lastGuessResult: "correct" | "wrong" | null;
  lastGuessedName: string | null;
}

export default function ChoiceGrid({
  choices,
  correctName,
  onGuess,
  disabled,
  lastGuessResult,
  lastGuessedName,
}: ChoiceGridProps) {
  const [flashName, setFlashName] = useState<string | null>(null);
  const [flashResult, setFlashResult] = useState<"correct" | "wrong" | null>(null);

  useEffect(() => {
    if (lastGuessedName && lastGuessResult) {
      setFlashName(lastGuessedName);
      setFlashResult(lastGuessResult);
      const t = setTimeout(() => {
        setFlashName(null);
        setFlashResult(null);
      }, 700);
      return () => clearTimeout(t);
    }
  }, [lastGuessedName, lastGuessResult]);

  return (
    <div className="w-full mt-6">
      <p className="text-xs text-slate-500 text-center mb-3 uppercase tracking-widest font-medium">
        Who is it?
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {choices.map((name) => {
          const isFlashing = flashName === name;
          const isCorrectFlash = isFlashing && flashResult === "correct";
          const isWrongFlash = isFlashing && flashResult === "wrong";

          return (
            <button
              key={name}
              onClick={() => !disabled && onGuess(name)}
              disabled={disabled}
              className={`
                relative py-3 px-4 rounded-xl text-sm font-medium transition-all duration-150 text-left
                ${disabled
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                }
                ${isCorrectFlash
                  ? "bg-green-500 text-white ring-2 ring-green-400 scale-[1.02]"
                  : isWrongFlash
                  ? "bg-red-500/80 text-white ring-2 ring-red-400 animate-shake"
                  : "bg-slate-800 text-slate-200 border border-slate-700 hover:border-green-500/50 hover:text-white"
                }
              `}
            >
              <span className="relative z-10">{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

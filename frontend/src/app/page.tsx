"use client";

import { useEffect } from "react";
import { useGame } from "@/hooks/useGame";
import GameHeader from "@/components/GameHeader";
import HintGrid from "@/components/HintGrid";
import ChoiceGrid from "@/components/ChoiceGrid";
import ResultScreen from "@/components/ResultScreen";

export default function Home() {
  const { state, fetchGame, revealNextHint, makeGuess } = useGame();
  const {
    trivia,
    revealedCount,
    choices,
    wrongGuesses,
    stars,
    status,
    loading,
    error,
    lastGuessResult,
    lastGuessedName,
  } = state;

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  const gameOver = status === "won" || status === "lost";

  return (
    <main className="min-h-screen bg-slate-950 flex items-start justify-center px-4 pt-10 pb-24">
      <div className="w-full max-w-md">
        <GameHeader stars={stars} wrongGuesses={wrongGuesses} />

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
            <p className="text-slate-500 text-sm">Preparing your trivia...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button
              onClick={fetchGame}
              className="px-5 py-2.5 bg-green-500 hover:bg-green-400 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {trivia && !loading && (
          <>
            <div className="mb-3">
              <p className="text-xs text-slate-500 text-center uppercase tracking-widest font-medium">
                Reveal hints · Guess the cricketer
              </p>
            </div>

            <HintGrid
              hints={trivia.hints}
              revealedCount={revealedCount}
              gameOver={gameOver}
              onReveal={revealNextHint}
            />

            <ChoiceGrid
              choices={choices}
              correctName={trivia["cricketer-name"]}
              onGuess={makeGuess}
              disabled={gameOver}
              lastGuessResult={lastGuessResult}
              lastGuessedName={lastGuessedName}
            />

            {revealedCount === 0 && !gameOver && (
              <p className="text-center text-xs text-slate-600 mt-4">
                Click the first card to reveal a hint
              </p>
            )}
          </>
        )}
      </div>

      {gameOver && trivia && (
        <ResultScreen
          won={status === "won"}
          correctName={trivia["cricketer-name"]}
          stars={stars}
          hints={trivia.hints}
          revealedCount={revealedCount}
          wrongGuesses={wrongGuesses}
          onNewGame={fetchGame}
        />
      )}
    </main>
  );
}

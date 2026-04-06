"use client";

interface GameHeaderProps {
  stars: number;
  wrongGuesses: number;
}

export default function GameHeader({ stars, wrongGuesses }: GameHeaderProps) {
  const maxWrong = 4;
  const hearts = Array.from({ length: maxWrong }, (_, i) => i < maxWrong - wrongGuesses);

  return (
    <header className="flex items-center justify-between w-full mb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Cricket Trivia
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">Guess the cricketer</p>
      </div>

      <div className="flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-1.5 bg-slate-800 rounded-full px-3 py-1.5">
          <span className="text-yellow-400 text-base">⭐</span>
          <span className="text-white font-bold text-sm tabular-nums">{stars}</span>
        </div>
        <div className="flex items-center gap-1">
          {hearts.map((alive, i) => (
            <span key={i} className={`text-sm transition-all ${alive ? "opacity-100" : "opacity-20 grayscale"}`}>
              ❤️
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}

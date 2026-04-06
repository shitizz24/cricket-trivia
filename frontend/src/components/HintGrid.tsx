"use client";

import { Hint } from "@/lib/types";
import HintCard from "./HintCard";

interface HintGridProps {
  hints: Hint[];
  revealedCount: number;
  gameOver: boolean;
  onReveal: () => void;
}

export default function HintGrid({
  hints,
  revealedCount,
  gameOver,
  onReveal,
}: HintGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {hints.map((hint, i) => (
        <HintCard
          key={i}
          hint={hint}
          index={i}
          revealed={i < revealedCount}
          isNext={i === revealedCount}
          gameOver={gameOver}
          onReveal={onReveal}
        />
      ))}
    </div>
  );
}

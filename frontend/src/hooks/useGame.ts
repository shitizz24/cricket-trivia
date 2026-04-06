"use client";

import { useCallback, useState } from "react";
import { getDistractors } from "@/lib/cricketers";
import { GameState, GameStatus, TriviaResponse } from "@/lib/types";

const HINT_STAR_COST = [0, 1, 2, 3] as const;
const WRONG_GUESS_COST = 1;
const MAX_WRONG_GUESSES = 4;
const INITIAL_STARS = 10;

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const initialState: GameState = {
  trivia: null,
  revealedCount: 0,
  choices: [],
  wrongGuesses: 0,
  stars: INITIAL_STARS,
  status: "playing",
  loading: false,
  error: null,
  lastGuessResult: null,
  lastGuessedName: null,
};

export function useGame() {
  const [state, setState] = useState<GameState>(initialState);

  const fetchGame = useCallback(async () => {
    setState({ ...initialState, loading: true });

    try {
      const res = await fetch("/api/trivia");
      if (!res.ok) throw new Error("Failed to fetch trivia");

      const data: TriviaResponse = await res.json();
      const correctName = data["cricketer-name"];
      const distractors = getDistractors(correctName, 3);
      const choices = shuffle([correctName, ...distractors]);

      setState({
        ...initialState,
        trivia: data,
        choices,
        loading: false,
      });
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Could not load trivia. Make sure the backend is running.",
      }));
    }
  }, []);

  const revealNextHint = useCallback(() => {
    setState((prev) => {
      if (
        !prev.trivia ||
        prev.status !== "playing" ||
        prev.revealedCount >= prev.trivia.hints.length
      )
        return prev;

      const cost = HINT_STAR_COST[prev.revealedCount] ?? 0;
      return {
        ...prev,
        revealedCount: prev.revealedCount + 1,
        stars: Math.max(0, prev.stars - cost),
      };
    });
  }, []);

  const makeGuess = useCallback((name: string) => {
    setState((prev) => {
      if (!prev.trivia || prev.status !== "playing") return prev;

      const correct =
        name.toLowerCase() === prev.trivia["cricketer-name"].toLowerCase();

      if (correct) {
        return {
          ...prev,
          status: "won" as GameStatus,
          lastGuessResult: "correct",
          lastGuessedName: name,
        };
      }

      const newWrongGuesses = prev.wrongGuesses + 1;
      const newStars = Math.max(0, prev.stars - WRONG_GUESS_COST);
      const lost = newWrongGuesses >= MAX_WRONG_GUESSES;

      return {
        ...prev,
        wrongGuesses: newWrongGuesses,
        stars: newStars,
        status: lost ? "lost" : "playing",
        lastGuessResult: "wrong",
        lastGuessedName: name,
      };
    });
  }, []);

  return { state, fetchGame, revealNextHint, makeGuess };
}

export interface Hint {
  "hint-type": "easy" | "medium" | "hard";
  "hint-statementt": string;
}

export interface TriviaResponse {
  "cricketer-name": string;
  hints: Hint[];
}

export type GameStatus = "playing" | "won" | "lost";

export interface GameState {
  trivia: TriviaResponse | null;
  revealedCount: number;
  choices: string[];
  wrongGuesses: number;
  stars: number;
  status: GameStatus;
  loading: boolean;
  error: string | null;
  lastGuessResult: "correct" | "wrong" | null;
  lastGuessedName: string | null;
}

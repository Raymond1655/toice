export type Part = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type Question = {
  id: string;
  part: Part;
  pool: "practice" | "mock";
  skill: string;
  mockSet?: string;
  topic?: string;
  format?: string;
  graphic?: string;
  graphicIpa?: string;
  prompt: string;
  options: string[];
  correct: number;
  explanation: string;
  group?: string;
  passage?: string;
  transcript?: string;
  translation?: string;
  image?: string;
  audio?: string;
  ipa?: string;
  optionIpa?: string[];
  passageIpa?: string;
};
export type Answer = { choice: number | string; guessed: boolean; ms: number };
export type Attempt = {
  id: string;
  title: string;
  mode: "practice" | "mini" | "mock" | "spelling" | "dictation";
  ids: string[];
  answers: Record<string, Answer>;
  startedAt: number;
  finishedAt: number | null;
  duration: number;
  index: number;
  played: string[];
};
export type AttemptRow = { id: string; revision: number; data: Attempt };
export type Annotation = { id: string; note: string; favorite: boolean };
export const partNames: Record<Part, string> = {
  1: "圖像描述",
  2: "應答問題",
  3: "簡短對話",
  4: "簡短獨白",
  5: "句子填空",
  6: "段落填空",
  7: "閱讀理解",
};

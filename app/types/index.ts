export interface Meal {
  id: number;
  name: string;
  calories: number;
  proteines: number;
  glucides: number;
  lipides: number;
  image_url?: string | null;
  date: string;
  created_at?: string;
}

export interface Goals {
  calories: number;
  proteines: number;
  glucides: number;
  lipides: number;
}

export interface MacroTotals {
  calories: number;
  proteines: number;
  glucides: number;
  lipides: number;
}

export interface AnalysisResult {
  name: string;
  calories: number;
  proteines: number;
  glucides: number;
  lipides: number;
}

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Goals } from "../types";

const DEFAULT_GOALS: Goals = {
  calories: 2000,
  proteines: 150,
  glucides: 200,
  lipides: 65,
};

const CACHE_KEY = "macrotrack-goals";
const ROW_ID = 1;

function readCache(): Goals | null {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    return stored ? (JSON.parse(stored) as Goals) : null;
  } catch {
    return null;
  }
}

function writeCache(goals: Goals) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(goals));
  } catch {
    // ignore storage errors
  }
}

export function useGoals() {
  // Initialise avec le cache localStorage pour éviter le flash
  const [goals, setGoals] = useState<Goals>(() => readCache() ?? DEFAULT_GOALS);
  const [loadingGoals, setLoadingGoals] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      const { data, error } = await supabase
        .from("goals")
        .select("calories, proteines, glucides, lipides")
        .eq("id", ROW_ID)
        .single();

      if (error) {
        // Table inexistante ou erreur réseau — on reste sur le cache
        console.warn("[useGoals] Supabase unavailable, using cache:", error.message);
      } else if (data) {
        const fetched: Goals = {
          calories: data.calories,
          proteines: data.proteines,
          glucides: data.glucides,
          lipides: data.lipides,
        };
        setGoals(fetched);
        writeCache(fetched);
      }
      setLoadingGoals(false);
    };

    fetchGoals();
  }, []);

  const updateGoals = async (newGoals: Goals) => {
    // Optimistic update
    setGoals(newGoals);
    writeCache(newGoals);

    const { error } = await supabase
      .from("goals")
      .upsert({ id: ROW_ID, ...newGoals, updated_at: new Date().toISOString() });

    if (error) {
      console.error("[useGoals] Failed to save goals to Supabase:", error.message);
      throw error;
    }
  };

  return { goals, loadingGoals, updateGoals };
}

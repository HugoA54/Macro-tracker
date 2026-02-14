"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { Meal, MacroTotals } from "../types";

export const todayKey = () => new Date().toISOString().split("T")[0];

export function useMeals() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(true);
  const today = todayKey();

  const fetchTodayMeals = useCallback(async () => {
    setLoadingMeals(true);
    const { data } = await supabase
      .from("meals")
      .select("*")
      .eq("date", today)
      .order("created_at", { ascending: true });
    if (data) setMeals(data);
    setLoadingMeals(false);
  }, [today]);

  useEffect(() => {
    fetchTodayMeals();
  }, [fetchTodayMeals]);

  const addMeal = useCallback(
    async (meal: Omit<Meal, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("meals")
        .insert([meal])
        .select()
        .single();
      if (error) throw error;
      if (data) setMeals((prev) => [...prev, data]);
      return data as Meal;
    },
    []
  );

  const updateMeal = useCallback(
    async (id: number, updates: Partial<Omit<Meal, "id" | "created_at">>) => {
      const { data, error } = await supabase
        .from("meals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      if (data) setMeals((prev) => prev.map((m) => (m.id === id ? data : m)));
      return data as Meal;
    },
    []
  );

  const deleteMeal = useCallback(async (id: number) => {
    const { error } = await supabase.from("meals").delete().eq("id", id);
    if (error) throw error;
    setMeals((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const totals: MacroTotals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      proteines: acc.proteines + m.proteines,
      glucides: acc.glucides + m.glucides,
      lipides: acc.lipides + m.lipides,
    }),
    { calories: 0, proteines: 0, glucides: 0, lipides: 0 }
  );

  return {
    meals,
    loadingMeals,
    totals,
    today,
    addMeal,
    updateMeal,
    deleteMeal,
    refetch: fetchTodayMeals,
  };
}

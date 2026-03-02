"use client";

import React, { useState } from "react";

import { useMeals } from "./hooks/useMeals";
import { useGoals } from "./hooks/useGoals";
import { useToast } from "./hooks/useToast";

import { MacroSummary } from "./components/MacroSummary";
import { MealCard } from "./components/MealCard";
import { PhotoAnalyzer } from "./components/PhotoAnalyzer";
import { HistoryTab } from "./components/HistoryTab";
import { EditMealModal } from "./components/EditMealModal";
import { GoalsModal } from "./components/GoalsModal";
import { ToastContainer } from "./components/Toast";

import { Meal, AnalysisResult } from "./types";

const P = {
  bg: "#0f0f12",
  card: "#16161c",
  border: "#2a2a35",
  accent: "#c8f060",
  text: "#f0f0f0",
  muted: "#7a7a90",
};

type Tab = "today" | "history";

export default function App() {
  const { meals, loadingMeals, totals, today, addMeal, updateMeal, deleteMeal } =
    useMeals();
  const { goals, updateGoals } = useGoals();

  const handleUpdateGoals = async (newGoals: import("./types").Goals) => {
    try {
      await updateGoals(newGoals);
      addToast("Objectifs sauvegardés.", "success");
    } catch {
      addToast("Erreur lors de la sauvegarde des objectifs.", "error");
    }
  };
  const { toasts, addToast, removeToast } = useToast();

  const [tab, setTab] = useState<Tab>("today");
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [showGoals, setShowGoals] = useState(false);

  /* ── Handlers ─────────────────────────────────────── */

  const handleConfirmAnalysis = async (result: AnalysisResult) => {
    try {
      await addMeal({
        name: result.name,
        calories: result.calories,
        proteines: result.proteines,
        glucides: result.glucides,
        lipides: result.lipides,
        date: today,
      });
      addToast(`${result.name} ajouté !`, "success");
    } catch {
      addToast("Erreur lors de la sauvegarde du repas.", "error");
      throw new Error("save failed");
    }
  };

  const handleUpdateMeal = async (id: number, updates: Partial<Meal>) => {
    try {
      await updateMeal(id, updates);
      addToast("Repas modifié.", "success");
    } catch {
      addToast("Erreur lors de la modification.", "error");
      throw new Error("update failed");
    }
  };

  const handleDeleteMeal = async (id: number) => {
    const meal = meals.find((m) => m.id === id);
    try {
      await deleteMeal(id);
      addToast(`${meal?.name ?? "Repas"} supprimé.`, "info");
    } catch {
      addToast("Erreur lors de la suppression.", "error");
    }
  };

  /* ── Render ───────────────────────────────────────── */

  return (
    <div
      style={{
        minHeight: "100vh",
        background: P.bg,
        color: P.text,
        paddingBottom: 60,
      }}
    >
      <div style={{ maxWidth: 450, margin: "0 auto", padding: "20px 16px" }}>
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <h1
            style={{
              fontSize: 22,
              fontWeight: "bold",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Macro<span style={{ color: P.accent }}>Track</span>
          </h1>
          <span
            style={{
              fontSize: 11,
              color: P.muted,
              background: P.card,
              border: `1px solid ${P.border}`,
              borderRadius: 6,
              padding: "3px 8px",
            }}
          >
            {new Date().toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>

        {/* ── Tab bar ── */}
        <div
          style={{
            display: "flex",
            background: P.card,
            padding: 4,
            borderRadius: 12,
            marginBottom: 20,
            border: `1px solid ${P.border}`,
          }}
        >
          {(["today", "history"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 9,
                border: "none",
                background: tab === t ? P.accent : "transparent",
                color: tab === t ? "#000" : P.muted,
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: 13,
                fontFamily: "inherit",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              {t === "today" ? "Aujourd'hui" : "Historique"}
            </button>
          ))}
        </div>

        {/* ── Today tab ── */}
        {tab === "today" && (
          <div style={{ animation: "fadeIn 0.2s ease-out" }}>
            <MacroSummary
              totals={totals}
              goals={goals}
              onEditGoals={() => setShowGoals(true)}
            />

            <PhotoAnalyzer onConfirm={handleConfirmAnalysis} />

            <div style={{ marginTop: 24 }}>
              {loadingMeals ? (
                <div
                  style={{
                    textAlign: "center",
                    color: P.muted,
                    fontSize: 13,
                    padding: "20px 0",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                >
                  Chargement des repas...
                </div>
              ) : meals.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: P.muted,
                    fontSize: 13,
                    padding: "32px 0",
                    lineHeight: 1.8,
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🍽️</div>
                  Aucun repas enregistré aujourd'hui.
                  <br />
                  Prends une photo pour commencer !
                </div>
              ) : (
                <>
                  <div
                    style={{
                      fontSize: 10,
                      color: P.muted,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: 10,
                    }}
                  >
                    {meals.length} repas · {today}
                  </div>
                  {meals.map((m) => (
                    <MealCard
                      key={m.id}
                      meal={m}
                      onDelete={handleDeleteMeal}
                      onEdit={setEditingMeal}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── History tab ── */}
        {tab === "history" && (
          <div style={{ animation: "fadeIn 0.2s ease-out" }}>
            <HistoryTab goals={goals} />
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {editingMeal && (
        <EditMealModal
          meal={editingMeal}
          onSave={handleUpdateMeal}
          onClose={() => setEditingMeal(null)}
        />
      )}

      {showGoals && (
        <GoalsModal
          goals={goals}
          onSave={handleUpdateGoals}
          onClose={() => setShowGoals(false)}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

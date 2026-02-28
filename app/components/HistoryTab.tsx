"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Meal, Goals, MacroTotals } from "../types";
import { MacroBar } from "./MacroBar";

const P = {
  bg: "#0f0f12",
  card: "#16161c",
  cardHover: "#1c1c24",
  border: "#2a2a35",
  accent: "#c8f060",
  text: "#f0f0f0",
  muted: "#7a7a90",
};

interface DayData {
  date: string;
  meals: Meal[];
  totals: MacroTotals;
}

interface HistoryTabProps {
  goals: Goals;
}

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr + "T12:00:00");
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const dStr = d.toDateString();
  if (dStr === yesterday.toDateString()) return "Hier";

  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

const computeTotals = (meals: Meal[]): MacroTotals =>
  meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      proteines: acc.proteines + m.proteines,
      glucides: acc.glucides + m.glucides,
      lipides: acc.lipides + m.lipides,
    }),
    { calories: 0, proteines: 0, glucides: 0, lipides: 0 }
  );

export const HistoryTab: React.FC<HistoryTabProps> = ({ goals }) => {
  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const { data } = await supabase
        .from("meals")
        .select("*")
        .lt("date", today)
        .gte("date", thirtyDaysAgo)
        .order("date", { ascending: false });

      if (data) {
        const grouped = (data as Meal[]).reduce(
          (acc: Record<string, Meal[]>, meal) => {
            if (!acc[meal.date]) acc[meal.date] = [];
            acc[meal.date].push(meal);
            return acc;
          },
          {}
        );

        setDays(
          Object.entries(grouped).map(([date, meals]) => ({
            date,
            meals,
            totals: computeTotals(meals),
          }))
        );
      }
      setLoading(false);
    };
    load();
  }, []);

  /* ── LOADING ──────────────────────────────────────────── */
  if (loading) {
    return (
      <div
        style={{ textAlign: "center", color: P.muted, marginTop: 60, lineHeight: 2 }}
      >
        <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
        Chargement de l'historique...
      </div>
    );
  }

  /* ── EMPTY ────────────────────────────────────────────── */
  if (days.length === 0) {
    return (
      <div style={{ textAlign: "center", color: P.muted, marginTop: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
        <div
          style={{ fontSize: 16, marginBottom: 8, color: P.text, fontWeight: "bold" }}
        >
          Pas encore d'historique
        </div>
        <div style={{ fontSize: 13 }}>
          Tes repas des 30 derniers jours apparaîtront ici.
        </div>
      </div>
    );
  }

  /* ── WEEKLY STATS ─────────────────────────────────────── */
  const last7 = days.slice(0, 7);
  const avg = {
    calories: Math.round(
      last7.reduce((a, d) => a + d.totals.calories, 0) / last7.length
    ),
    proteines: Math.round(
      last7.reduce((a, d) => a + d.totals.proteines, 0) / last7.length
    ),
    glucides: Math.round(
      last7.reduce((a, d) => a + d.totals.glucides, 0) / last7.length
    ),
    lipides: Math.round(
      last7.reduce((a, d) => a + d.totals.lipides, 0) / last7.length
    ),
  };

  const STAT_ITEMS = [
    { label: "Kcal moy.", value: avg.calories, unit: "", color: "#c8f060", goal: goals.calories },
    { label: "Protéines", value: avg.proteines, unit: "g", color: "#60d4f0", goal: goals.proteines },
    { label: "Glucides", value: avg.glucides, unit: "g", color: "#f0c060", goal: goals.glucides },
    { label: "Lipides", value: avg.lipides, unit: "g", color: "#f060a8", goal: goals.lipides },
  ];

  return (
    <div>
      {/* Weekly average card */}
      <div
        style={{
          background: P.card,
          border: `1px solid ${P.border}`,
          borderRadius: 16,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: P.muted,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 12,
          }}
        >
          Moyenne — {last7.length} dernier{last7.length > 1 ? "s" : ""} jour
          {last7.length > 1 ? "s" : ""}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 8,
            marginBottom: 12,
          }}
        >
          {STAT_ITEMS.map(({ label, value, unit, color }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color,
                  fontVariantNumeric: "tabular-nums",
                  lineHeight: 1.2,
                }}
              >
                {value}
                {unit}
              </div>
              <div style={{ fontSize: 10, color: P.muted, marginTop: 2 }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Goal adherence mini-bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {STAT_ITEMS.map(({ label, value, unit, color, goal }) => {
            const pct = Math.min(100, Math.round((value / goal) * 100));
            return (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, color: P.muted, width: 52, flexShrink: 0 }}>
                  {label}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 4,
                    background: P.border,
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: pct >= 100 ? "#f0c060" : color,
                      borderRadius: 2,
                    }}
                  />
                </div>
                <span style={{ fontSize: 10, color: P.muted, width: 32, textAlign: "right", flexShrink: 0 }}>
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day list */}
      {days.map((day) => {
        const isExpanded = expandedDate === day.date;
        const isOver = day.totals.calories > goals.calories;
        const calPct = Math.min(
          100,
          Math.round((day.totals.calories / goals.calories) * 100)
        );

        return (
          <div
            key={day.date}
            style={{
              background: P.card,
              border: `1px solid ${P.border}`,
              borderRadius: 16,
              marginBottom: 10,
              overflow: "hidden",
            }}
          >
            {/* Day header (clickable) */}
            <button
              onClick={() =>
                setExpandedDate(isExpanded ? null : day.date)
              }
              style={{
                width: "100%",
                padding: "14px 16px",
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: P.text,
                textAlign: "left",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: "bold",
                    textTransform: "capitalize",
                  }}
                >
                  {formatDate(day.date)}
                </div>
                <div style={{ fontSize: 11, color: P.muted, marginTop: 2 }}>
                  {day.meals.length} repas
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: isOver ? "#f0c060" : P.accent,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {day.totals.calories}{" "}
                    <span
                      style={{ fontSize: 11, fontWeight: "normal", color: P.muted }}
                    >
                      kcal
                    </span>
                  </div>
                  <div
                    style={{
                      height: 4,
                      width: 56,
                      background: P.border,
                      borderRadius: 2,
                      overflow: "hidden",
                      marginTop: 4,
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${calPct}%`,
                        background: isOver ? "#f0c060" : P.accent,
                        borderRadius: 2,
                      }}
                    />
                  </div>
                </div>
                <span style={{ color: P.muted, fontSize: 11 }}>
                  {isExpanded ? "▲" : "▼"}
                </span>
              </div>
            </button>

            {/* Expanded detail */}
            {isExpanded && (
              <div
                style={{
                  padding: "0 16px 16px",
                  borderTop: `1px solid ${P.border}`,
                  animation: "fadeIn 0.2s ease-out",
                }}
              >
                <div style={{ paddingTop: 14, marginBottom: 14 }}>
                  <MacroBar
                    label="Protéines"
                    value={day.totals.proteines}
                    goal={goals.proteines}
                    color="#60d4f0"
                  />
                  <MacroBar
                    label="Glucides"
                    value={day.totals.glucides}
                    goal={goals.glucides}
                    color="#f0c060"
                  />
                  <MacroBar
                    label="Lipides"
                    value={day.totals.lipides}
                    goal={goals.lipides}
                    color="#f060a8"
                  />
                </div>

                <div
                  style={{
                    fontSize: 10,
                    color: P.muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 8,
                  }}
                >
                  Repas
                </div>

                {day.meals.map((m, i) => (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 0",
                      borderBottom:
                        i < day.meals.length - 1
                          ? `1px solid ${P.border}`
                          : "none",
                    }}
                  >
                    {m.image_url && (
                      <img
                        src={m.image_url}
                        alt={m.name}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 7,
                          objectFit: "cover",
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {m.name}
                      </div>
                      <div style={{ fontSize: 11, color: P.muted }}>
                        {m.calories} kcal · {m.proteines}g P · {m.glucides}g G
                        · {m.lipides}g L
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

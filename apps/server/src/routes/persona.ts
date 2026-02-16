import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import type { Persona } from "@admeet/shared";

export const personaRoutes = Router();

// Convert DB snake_case row to camelCase Persona
function toPersona(row: Record<string, unknown>): Persona {
  return {
    id: row.id as string,
    name: row.name as string,
    role: row.role as string,
    expertise: row.expertise as string[],
    systemPrompt: row.system_prompt as string,
    thoughtCategories: row.thought_categories as Persona["thoughtCategories"],
    signalKeywords: row.signal_keywords as string[],
    stateFields: row.state_fields as Persona["stateFields"],
    isPreset: row.is_preset as boolean,
    createdBy: row.created_by as string | undefined,
    createdAt: row.created_at as string | undefined,
  };
}

// Convert camelCase Persona to DB snake_case
function toDbRow(persona: Partial<Persona>) {
  const row: Record<string, unknown> = {};
  if (persona.name !== undefined) row.name = persona.name;
  if (persona.role !== undefined) row.role = persona.role;
  if (persona.expertise !== undefined) row.expertise = persona.expertise;
  if (persona.systemPrompt !== undefined) row.system_prompt = persona.systemPrompt;
  if (persona.thoughtCategories !== undefined) row.thought_categories = persona.thoughtCategories;
  if (persona.signalKeywords !== undefined) row.signal_keywords = persona.signalKeywords;
  if (persona.stateFields !== undefined) row.state_fields = persona.stateFields;
  if (persona.isPreset !== undefined) row.is_preset = persona.isPreset;
  if (persona.createdBy !== undefined) row.created_by = persona.createdBy;
  return row;
}

// GET /api/personas - list all (presets + custom)
personaRoutes.get("/", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("personas")
      .select("*")
      .order("is_preset", { ascending: false })
      .order("created_at", { ascending: true });

    if (error) throw error;

    const personas = (data || []).map(toPersona);
    res.json(personas);
  } catch (error) {
    console.error("[persona] List error:", error);
    res.status(500).json({ error: "페르소나 목록 조회 실패" });
  }
});

// GET /api/personas/:id - single
personaRoutes.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("personas")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: "페르소나를 찾을 수 없음" });
      return;
    }

    res.json(toPersona(data));
  } catch (error) {
    console.error("[persona] Get error:", error);
    res.status(500).json({ error: "페르소나 조회 실패" });
  }
});

// POST /api/personas - create custom
personaRoutes.post("/", async (req, res) => {
  try {
    const body = req.body as Partial<Persona>;
    const dbRow = toDbRow(body);
    dbRow.is_preset = false; // custom personas are never presets

    const { data, error } = await supabase
      .from("personas")
      .insert(dbRow)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(toPersona(data));
  } catch (error) {
    console.error("[persona] Create error:", error);
    res.status(500).json({ error: "페르소나 생성 실패" });
  }
});

// PUT /api/personas/:id - update
personaRoutes.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body as Partial<Persona>;
    const dbRow = toDbRow(body);

    const { data, error } = await supabase
      .from("personas")
      .update(dbRow)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json(toPersona(data));
  } catch (error) {
    console.error("[persona] Update error:", error);
    res.status(500).json({ error: "페르소나 수정 실패" });
  }
});

// DELETE /api/personas/:id - delete (presets blocked)
personaRoutes.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if preset
    const { data: existing, error: fetchError } = await supabase
      .from("personas")
      .select("is_preset")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;
    if (!existing) {
      res.status(404).json({ error: "페르소나를 찾을 수 없음" });
      return;
    }

    if (existing.is_preset) {
      res.status(403).json({ error: "프리셋 페르소나는 삭제할 수 없습니다" });
      return;
    }

    const { error } = await supabase
      .from("personas")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error("[persona] Delete error:", error);
    res.status(500).json({ error: "페르소나 삭제 실패" });
  }
});

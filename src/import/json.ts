import {
  CHARACTER_SCHEMA_VERSION,
  createBlankCharacter,
  emptyConsequences,
  emptyStressTrack,
  makeId,
  type Character,
} from "../model/character";

/**
 * Character JSON export format. `schemaVersion` is bumped whenever
 * `Character`'s shape changes; `migrateCharacter` below is the single place
 * that upgrades older exports so imports keep working across app versions.
 */
export interface CharacterExportFile {
  schemaVersion: number;
  character: Character;
}

export function exportCharacterToJson(character: Character): string {
  const payload: CharacterExportFile = {
    schemaVersion: CHARACTER_SCHEMA_VERSION,
    character,
  };
  return JSON.stringify(payload, null, 2);
}

export function downloadCharacterJson(character: Character): void {
  const json = exportCharacterToJson(character);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${character.name.trim() || "character"}.fate.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asNumber(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

/**
 * Normalizes an arbitrary (possibly partial, possibly stale-schema) object
 * into a complete, well-typed Character. Missing fields fall back to the
 * blank-character defaults rather than throwing, so hand-edited or
 * older-version JSON still loads. Currently there is only schemaVersion 1,
 * so this is identity-shaped; future versions add real migration steps here.
 */
export function migrateCharacter(
  raw: unknown,
  ownerId: string | null,
): Character {
  const blank = createBlankCharacter(ownerId);
  if (!raw || typeof raw !== "object") return blank;
  const r = raw as Record<string, unknown>;

  const aspect = (v: unknown) => {
    if (!v || typeof v !== "object") return { ...blank.highConcept, id: makeId() };
    const a = v as Record<string, unknown>;
    return {
      id: makeId(),
      title: asString(a.title),
      description: asString(a.description),
      notes: asString(a.notes),
    };
  };

  const aspects = Array.isArray(r.aspects)
    ? r.aspects.map((a) => aspect(a))
    : [];

  const skills = Array.isArray(r.skills)
    ? r.skills
        .filter((s) => s && typeof s === "object")
        .map((s) => {
          const sk = s as Record<string, unknown>;
          return {
            id: makeId(),
            name: asString(sk.name),
            rating: asNumber(sk.rating, 0) as Character["skills"][number]["rating"],
          };
        })
    : [];

  const stunts = Array.isArray(r.stunts)
    ? r.stunts
        .filter((s) => s && typeof s === "object")
        .map((s) => {
          const st = s as Record<string, unknown>;
          return {
            id: makeId(),
            name: asString(st.name),
            description: asString(st.description),
          };
        })
    : [];

  const equipment = Array.isArray(r.equipment)
    ? r.equipment
        .filter((e) => e && typeof e === "object")
        .map((e) => {
          const eq = e as Record<string, unknown>;
          const category = asString(eq.category, "gear");
          return {
            id: makeId(),
            name: asString(eq.name),
            category: (["weapon", "armor", "gear", "extra"].includes(category)
              ? category
              : "gear") as Character["equipment"][number]["category"],
            description: asString(eq.description),
            effect: asString(eq.effect),
            quantity: asNumber(eq.quantity, 1),
          };
        })
    : [];

  const stressTrack = (v: unknown, size: number) => {
    if (v && typeof v === "object" && Array.isArray((v as { boxes?: unknown }).boxes)) {
      return { boxes: (v as { boxes: unknown[] }).boxes.map(Boolean) };
    }
    return emptyStressTrack(size);
  };

  const consequences = Array.isArray(r.consequences) && r.consequences.length === 4
    ? r.consequences.map((cq, i) => {
        const c = cq as Record<string, unknown>;
        const fallback = emptyConsequences()[i];
        return {
          severity: fallback.severity,
          value: fallback.value,
          text: asString(c.text),
          used: Boolean(c.used),
        };
      })
    : emptyConsequences();

  const now = Date.now();

  return {
    id: makeId(),
    schemaVersion: CHARACTER_SCHEMA_VERSION,
    ownerId,
    name: asString(r.name, blank.name),
    pronouns: asString(r.pronouns),
    description: asString(r.description),
    avatarUrl: asString(r.avatarUrl),
    fatePoints: asNumber(r.fatePoints, blank.fatePoints),
    refresh: asNumber(r.refresh, blank.refresh),
    highConcept: aspect(r.highConcept),
    trouble: aspect(r.trouble),
    aspects,
    skills,
    stunts,
    physicalStress: stressTrack(r.physicalStress, 4),
    mentalStress: stressTrack(r.mentalStress, 4),
    consequences,
    equipment,
    createdAt: now,
    updatedAt: now,
  };
}

export function parseCharacterJsonFile(
  text: string,
  ownerId: string | null,
): Character {
  const data = JSON.parse(text);
  const characterRaw =
    data && typeof data === "object" && "character" in data
      ? (data as CharacterExportFile).character
      : data;
  return migrateCharacter(characterRaw, ownerId);
}

/**
 * Fate Core character sheet data model.
 *
 * `schemaVersion` is bumped whenever the shape of `Character` changes so the
 * JSON import layer (see src/import/json.ts) can migrate older exports.
 */

export const CHARACTER_SCHEMA_VERSION = 1;

export interface Aspect {
  id: string;
  title: string;
  description: string;
  notes: string;
}

/** Fate ladder ratings. Fate Core caps PCs at Superb (+5); NPCs can go higher. */
export type SkillRating =
  | -2
  | -1
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10;

export const FATE_LADDER: Record<number, string> = {
  10: "Legendary+",
  9: "Legendary",
  8: "Legendary",
  7: "Epic",
  6: "Fantastic",
  5: "Superb",
  4: "Great",
  3: "Good",
  2: "Fair",
  1: "Average",
  0: "Mediocre",
  [-1]: "Poor",
  [-2]: "Terrible",
};

export function ladderName(rating: number): string {
  return FATE_LADDER[rating] ?? (rating > 0 ? `+${rating}` : `${rating}`);
}

export interface Skill {
  id: string;
  name: string;
  rating: SkillRating;
}

export interface Stunt {
  id: string;
  name: string;
  description: string;
}

export type EquipmentCategory = "weapon" | "armor" | "gear" | "extra";

export interface EquipmentItem {
  id: string;
  name: string;
  category: EquipmentCategory;
  description: string;
  effect: string;
  quantity: number;
}

export interface StressTrack {
  /** Number of boxes in this track (adjustable, default 4). */
  boxes: boolean[];
}

export type ConsequenceSeverity = "mild" | "mild2" | "moderate" | "severe";

export interface Consequence {
  severity: ConsequenceSeverity;
  /** Point value shown to the user, e.g. -2, -4, -6. Derived from severity but kept for display convenience. */
  value: number;
  text: string;
  used: boolean;
}

export interface Character {
  id: string;
  schemaVersion: number;

  /** Owlbear player id of the owner. Players may only edit sheets they own; the GM may edit all. */
  ownerId: string | null;

  name: string;
  pronouns: string;
  description: string;
  avatarUrl: string;

  fatePoints: number;
  refresh: number;

  highConcept: Aspect;
  trouble: Aspect;
  aspects: Aspect[];

  skills: Skill[];
  stunts: Stunt[];

  physicalStress: StressTrack;
  mentalStress: StressTrack;

  consequences: Consequence[];

  equipment: EquipmentItem[];

  createdAt: number;
  updatedAt: number;
}

function makeId(): string {
  return crypto.randomUUID();
}

export function emptyAspect(): Aspect {
  return { id: makeId(), title: "", description: "", notes: "" };
}

export function emptyStressTrack(size = 4): StressTrack {
  return { boxes: new Array(size).fill(false) };
}

export function emptyConsequences(): Consequence[] {
  return [
    { severity: "mild", value: -2, text: "", used: false },
    { severity: "mild2", value: -2, text: "", used: false },
    { severity: "moderate", value: -4, text: "", used: false },
    { severity: "severe", value: -6, text: "", used: false },
  ];
}

export function createBlankCharacter(ownerId: string | null): Character {
  const now = Date.now();
  return {
    id: makeId(),
    schemaVersion: CHARACTER_SCHEMA_VERSION,
    ownerId,
    name: "New Character",
    pronouns: "",
    description: "",
    avatarUrl: "",
    fatePoints: 3,
    refresh: 3,
    highConcept: { ...emptyAspect(), title: "" },
    trouble: { ...emptyAspect(), title: "" },
    aspects: [],
    skills: [],
    stunts: [],
    physicalStress: emptyStressTrack(),
    mentalStress: emptyStressTrack(),
    consequences: emptyConsequences(),
    equipment: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function duplicateCharacter(source: Character, ownerId: string | null): Character {
  const now = Date.now();
  return {
    ...structuredClone(source),
    id: makeId(),
    ownerId,
    name: `${source.name} (Copy)`,
    createdAt: now,
    updatedAt: now,
  };
}

export function newAspectFor(): Aspect {
  return emptyAspect();
}

export function newSkill(): Skill {
  return { id: makeId(), name: "", rating: 0 };
}

export function newStunt(): Stunt {
  return { id: makeId(), name: "", description: "" };
}

export function newEquipmentItem(): EquipmentItem {
  return {
    id: makeId(),
    name: "",
    category: "gear",
    description: "",
    effect: "",
    quantity: 1,
  };
}

export { makeId };

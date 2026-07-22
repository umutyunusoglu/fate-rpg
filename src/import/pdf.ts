import { PDFDocument, type PDFForm } from "pdf-lib";
import {
  createBlankCharacter,
  emptyConsequences,
  emptyStressTrack,
  makeId,
  type Character,
  type ConsequenceSeverity,
  type SkillRating,
} from "../model/character";

/**
 * Field-name mapping for the official Fate Core form-fillable PDF. These
 * names are fixed by that specific template -- if Evil Hat ever ships a
 * revised template with different field names, this map (and only this
 * map) needs updating.
 */

function getText(form: PDFForm, name: string): string {
  try {
    return form.getTextField(name).getText()?.trim() ?? "";
  } catch {
    return "";
  }
}

function getChecked(form: PDFForm, name: string): boolean {
  try {
    return form.getCheckBox(name).isChecked();
  } catch {
    return false;
  }
}

/**
 * The PDF does not store a skill's rating directly -- it's implied by
 * which numbered field the skill name sits in. Skill 1-5 sit in the Superb
 * row, 6-10 in Great, 11-15 in Good, 16-20 in Fair, 21-25 in Average, and
 * 26 is the single Unranked/Average row at the bottom of the pyramid.
 */
function ratingForSkillField(n: number): SkillRating {
  if (n <= 5) return 5;
  if (n <= 10) return 4;
  if (n <= 15) return 3;
  if (n <= 20) return 2;
  if (n <= 25) return 1;
  return 0;
}

const CONSEQUENCE_FIELD_MAP: Record<
  ConsequenceSeverity,
  { aspectField: string; checkField: string }
> = {
  mild: { aspectField: "Consequence Aspect 1", checkField: "Consequence 1" },
  moderate: { aspectField: "Consequence Aspect 2", checkField: "Consequence 2" },
  severe: { aspectField: "Consequence Aspect 3", checkField: "Consequence 3" },
  mild2: { aspectField: "Consequence Aspect 4", checkField: "Consequence 4" },
};

export async function parseFateCorePdf(
  file: File | ArrayBuffer,
  ownerId: string | null,
): Promise<Character> {
  const bytes = file instanceof ArrayBuffer ? file : await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes);
  const form = pdfDoc.getForm();

  const character = createBlankCharacter(ownerId);

  character.name = getText(form, "Name");
  character.pronouns = getText(form, "Pronouns");
  character.description = getText(form, "Description");

  character.highConcept = {
    id: makeId(),
    title: getText(form, "Aspect 1"),
    description: "",
    notes: "",
  };
  character.trouble = {
    id: makeId(),
    title: getText(form, "Aspect 2"),
    description: "",
    notes: "",
  };

  const otherAspectsBlock = getText(form, "Aspect 3");
  character.aspects = otherAspectsBlock
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => ({
      id: makeId(),
      title: line,
      description: "",
      notes: "",
    }));

  const skills: Character["skills"] = [];
  for (let n = 1; n <= 26; n++) {
    const name = getText(form, `Skill ${n}`);
    if (!name) continue;
    skills.push({ id: makeId(), name, rating: ratingForSkillField(n) });
  }
  character.skills = skills;

  const stuntsAndExtras = getText(form, "Stunts and Extras");
  character.stunts = stuntsAndExtras
    ? [
        {
          id: makeId(),
          name: "Imported: Stunts and Extras",
          description: stuntsAndExtras,
        },
      ]
    : [];

  const refreshText = getText(form, "Refresh");
  character.refresh = refreshText ? Number(refreshText) || 3 : 3;

  const currentFateText = getText(form, "Current Fate");
  character.fatePoints = currentFateText ? Number(currentFateText) || 0 : 0;

  character.physicalStress = emptyStressTrack(4);
  character.physicalStress.boxes = [1, 2, 3, 4].map((n) =>
    getChecked(form, `Stress ${n}`),
  );

  character.mentalStress = emptyStressTrack(4);
  character.mentalStress.boxes = [5, 6, 7, 8].map((n) =>
    getChecked(form, `Stress ${n}`),
  );

  character.consequences = emptyConsequences().map((base) => {
    const fields = CONSEQUENCE_FIELD_MAP[base.severity];
    return {
      ...base,
      text: getText(form, fields.aspectField),
      used: getChecked(form, fields.checkField),
    };
  });

  character.equipment = [];

  return character;
}

/**
 * The field-name mapping above is specific to the official Fate Core
 * template. If a caller uploads some other PDF (a different game's sheet,
 * a scanned/flattened form with no AcroForm fields, etc), `getText`/
 * `getChecked` silently return empty defaults for every field rather than
 * throwing -- so the result would otherwise look like a validly-imported
 * blank character with no error at all. Use this to detect that case and
 * warn the user instead of handing them a silently-empty sheet.
 */
export function looksLikeUnrecognizedFateCorePdf(character: Character): boolean {
  return (
    !character.name &&
    !character.highConcept.title &&
    !character.trouble.title &&
    character.aspects.length === 0 &&
    character.skills.length === 0 &&
    character.stunts.length === 0
  );
}

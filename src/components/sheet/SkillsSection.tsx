import type { Character, SkillRating } from "../../model/character";
import { ladderName, newSkill } from "../../model/character";
import { moveItem, removeAt, replaceAt } from "../../utils/array";

interface SkillsSectionProps {
  character: Character;
  editable: boolean;
  patch: (updater: (c: Character) => Character) => void;
}

const RATING_OPTIONS = Array.from({ length: 13 }, (_, i) => 10 - i); // 10..-2

export function SkillsSection({
  character,
  editable,
  patch,
}: SkillsSectionProps) {
  const grouped = new Map<number, string[]>();
  for (const skill of character.skills) {
    if (!skill.name.trim()) continue;
    const list = grouped.get(skill.rating) ?? [];
    list.push(skill.name);
    grouped.set(skill.rating, list);
  }
  const groupRatings = Array.from(grouped.keys()).sort((a, b) => b - a);

  return (
    <section className="sheet-section">
      <h2>Skills</h2>

      <div className="skill-rows">
        {character.skills.map((skill, i) => (
          <div className="skill-row" key={skill.id}>
            <input
              className="skill-name"
              value={skill.name}
              disabled={!editable}
              placeholder="Skill name"
              onChange={(e) =>
                patch((c) => ({
                  ...c,
                  skills: replaceAt(c.skills, i, {
                    ...skill,
                    name: e.target.value,
                  }),
                }))
              }
            />
            <select
              value={skill.rating}
              disabled={!editable}
              onChange={(e) =>
                patch((c) => ({
                  ...c,
                  skills: replaceAt(c.skills, i, {
                    ...skill,
                    rating: Number(e.target.value) as SkillRating,
                  }),
                }))
              }
            >
              {RATING_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r >= 0 ? `+${r}` : r} {ladderName(r)}
                </option>
              ))}
            </select>
            {editable && (
              <div className="row-actions">
                <button
                  type="button"
                  onClick={() =>
                    patch((c) => ({ ...c, skills: moveItem(c.skills, i, -1) }))
                  }
                  disabled={i === 0}
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() =>
                    patch((c) => ({ ...c, skills: moveItem(c.skills, i, 1) }))
                  }
                  disabled={i === character.skills.length - 1}
                  title="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() =>
                    patch((c) => ({ ...c, skills: removeAt(c.skills, i) }))
                  }
                  title="Remove"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {editable && (
        <button
          type="button"
          onClick={() =>
            patch((c) => ({ ...c, skills: [...c.skills, newSkill()] }))
          }
        >
          Add skill
        </button>
      )}

      {groupRatings.length > 0 && (
        <div className="skill-pyramid">
          <h3>Pyramid</h3>
          {groupRatings.map((rating) => (
            <div className="skill-pyramid-row" key={rating}>
              <span className="skill-pyramid-rating">
                {rating >= 0 ? `+${rating}` : rating} {ladderName(rating)}
              </span>
              <span className="skill-pyramid-names">
                {grouped.get(rating)!.join(", ")}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

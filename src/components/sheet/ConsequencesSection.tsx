import type { Character, Consequence } from "../../model/character";

interface ConsequencesSectionProps {
  character: Character;
  editable: boolean;
  patch: (updater: (c: Character) => Character) => void;
}

const SEVERITY_LABELS: Record<Consequence["severity"], string> = {
  mild: "Mild (-2)",
  mild2: "Mild (-2)",
  moderate: "Moderate (-4)",
  severe: "Severe (-6)",
};

export function ConsequencesSection({
  character,
  editable,
  patch,
}: ConsequencesSectionProps) {
  return (
    <section className="sheet-section">
      <h2>Consequences</h2>
      {character.consequences.map((consequence, i) => (
        <div className="consequence-row" key={consequence.severity}>
          <span className="consequence-label">
            {SEVERITY_LABELS[consequence.severity]}
          </span>
          <input
            className="consequence-text"
            value={consequence.text}
            disabled={!editable}
            placeholder="Aspect describing the injury"
            onChange={(e) =>
              patch((c) => {
                const consequences = c.consequences.slice();
                consequences[i] = { ...consequence, text: e.target.value };
                return { ...c, consequences };
              })
            }
          />
          <label className="consequence-used">
            <input
              type="checkbox"
              checked={consequence.used}
              disabled={!editable}
              onChange={(e) =>
                patch((c) => {
                  const consequences = c.consequences.slice();
                  consequences[i] = {
                    ...consequence,
                    used: e.target.checked,
                  };
                  return { ...c, consequences };
                })
              }
            />
            In use
          </label>
        </div>
      ))}
    </section>
  );
}

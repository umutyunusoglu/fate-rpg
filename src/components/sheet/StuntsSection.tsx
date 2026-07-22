import type { Character } from "../../model/character";
import { newStunt } from "../../model/character";
import { moveItem, removeAt, replaceAt } from "../../utils/array";

interface StuntsSectionProps {
  character: Character;
  editable: boolean;
  patch: (updater: (c: Character) => Character) => void;
}

export function StuntsSection({
  character,
  editable,
  patch,
}: StuntsSectionProps) {
  return (
    <section className="sheet-section">
      <h2>Stunts</h2>

      {character.stunts.map((stunt, i) => (
        <div className="stunt-row" key={stunt.id}>
          <input
            className="stunt-name"
            value={stunt.name}
            disabled={!editable}
            placeholder="Stunt name"
            onChange={(e) =>
              patch((c) => ({
                ...c,
                stunts: replaceAt(c.stunts, i, {
                  ...stunt,
                  name: e.target.value,
                }),
              }))
            }
          />
          <textarea
            rows={2}
            placeholder="Effect"
            value={stunt.description}
            disabled={!editable}
            onChange={(e) =>
              patch((c) => ({
                ...c,
                stunts: replaceAt(c.stunts, i, {
                  ...stunt,
                  description: e.target.value,
                }),
              }))
            }
          />
          {editable && (
            <div className="row-actions">
              <button
                type="button"
                onClick={() =>
                  patch((c) => ({ ...c, stunts: moveItem(c.stunts, i, -1) }))
                }
                disabled={i === 0}
                title="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() =>
                  patch((c) => ({ ...c, stunts: moveItem(c.stunts, i, 1) }))
                }
                disabled={i === character.stunts.length - 1}
                title="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                className="danger"
                onClick={() =>
                  patch((c) => ({ ...c, stunts: removeAt(c.stunts, i) }))
                }
                title="Remove"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      ))}

      {editable && (
        <button
          type="button"
          onClick={() =>
            patch((c) => ({ ...c, stunts: [...c.stunts, newStunt()] }))
          }
        >
          Add stunt
        </button>
      )}
    </section>
  );
}

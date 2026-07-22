import type { Aspect, Character } from "../../model/character";
import { newAspectFor } from "../../model/character";
import { moveItem, removeAt, replaceAt } from "../../utils/array";

interface AspectsSectionProps {
  character: Character;
  editable: boolean;
  patch: (updater: (c: Character) => Character) => void;
}

function AspectFields({
  aspect,
  editable,
  onChange,
}: {
  aspect: Aspect;
  editable: boolean;
  onChange: (aspect: Aspect) => void;
}) {
  return (
    <div className="aspect-fields">
      <input
        className="aspect-title"
        value={aspect.title}
        disabled={!editable}
        placeholder="Aspect title"
        onChange={(e) => onChange({ ...aspect, title: e.target.value })}
      />
      <textarea
        rows={1}
        placeholder="Description (optional)"
        value={aspect.description}
        disabled={!editable}
        onChange={(e) => onChange({ ...aspect, description: e.target.value })}
      />
      <textarea
        rows={1}
        placeholder="Notes (invokes / compels)"
        value={aspect.notes}
        disabled={!editable}
        onChange={(e) => onChange({ ...aspect, notes: e.target.value })}
      />
    </div>
  );
}

export function AspectsSection({
  character,
  editable,
  patch,
}: AspectsSectionProps) {
  return (
    <section className="sheet-section">
      <h2>Aspects</h2>

      <div className="aspect-row">
        <span className="aspect-label">High Concept</span>
        <AspectFields
          aspect={character.highConcept}
          editable={editable}
          onChange={(aspect) => patch((c) => ({ ...c, highConcept: aspect }))}
        />
      </div>

      <div className="aspect-row">
        <span className="aspect-label">Trouble</span>
        <AspectFields
          aspect={character.trouble}
          editable={editable}
          onChange={(aspect) => patch((c) => ({ ...c, trouble: aspect }))}
        />
      </div>

      {character.aspects.map((aspect, i) => (
        <div className="aspect-row" key={aspect.id}>
          <span className="aspect-label">Aspect</span>
          <AspectFields
            aspect={aspect}
            editable={editable}
            onChange={(next) =>
              patch((c) => ({
                ...c,
                aspects: replaceAt(c.aspects, i, next),
              }))
            }
          />
          {editable && (
            <div className="row-actions">
              <button
                type="button"
                onClick={() =>
                  patch((c) => ({ ...c, aspects: moveItem(c.aspects, i, -1) }))
                }
                disabled={i === 0}
                title="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() =>
                  patch((c) => ({ ...c, aspects: moveItem(c.aspects, i, 1) }))
                }
                disabled={i === character.aspects.length - 1}
                title="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                className="danger"
                onClick={() =>
                  patch((c) => ({ ...c, aspects: removeAt(c.aspects, i) }))
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
            patch((c) => ({ ...c, aspects: [...c.aspects, newAspectFor()] }))
          }
        >
          Add aspect
        </button>
      )}
    </section>
  );
}

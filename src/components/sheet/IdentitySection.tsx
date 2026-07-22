import type { Character } from "../../model/character";

interface IdentitySectionProps {
  character: Character;
  editable: boolean;
  patch: (updater: (c: Character) => Character) => void;
}

export function IdentitySection({
  character,
  editable,
  patch,
}: IdentitySectionProps) {
  return (
    <section className="sheet-section identity-section">
      <div className="identity-top">
        {character.avatarUrl ? (
          <img className="identity-avatar" src={character.avatarUrl} alt="" />
        ) : (
          <div className="identity-avatar placeholder" aria-hidden="true">
            {character.name.trim().charAt(0).toUpperCase() || "?"}
          </div>
        )}
        <div className="identity-fields">
          <label>
            Name
            <input
              value={character.name}
              disabled={!editable}
              onChange={(e) =>
                patch((c) => ({ ...c, name: e.target.value }))
              }
            />
          </label>
          <label>
            Pronouns
            <input
              value={character.pronouns}
              disabled={!editable}
              onChange={(e) =>
                patch((c) => ({ ...c, pronouns: e.target.value }))
              }
            />
          </label>
        </div>
      </div>

      <label>
        Avatar URL
        <input
          value={character.avatarUrl}
          disabled={!editable}
          placeholder="https://..."
          onChange={(e) =>
            patch((c) => ({ ...c, avatarUrl: e.target.value }))
          }
        />
      </label>

      <label>
        Description
        <textarea
          rows={2}
          value={character.description}
          disabled={!editable}
          onChange={(e) =>
            patch((c) => ({ ...c, description: e.target.value }))
          }
        />
      </label>

      <div className="fate-row">
        <div className="fate-points">
          <span>Fate Points</span>
          <div className="stepper">
            <button
              type="button"
              disabled={!editable}
              onClick={() =>
                patch((c) => ({
                  ...c,
                  fatePoints: Math.max(0, c.fatePoints - 1),
                }))
              }
            >
              -
            </button>
            <span className="stepper-value">{character.fatePoints}</span>
            <button
              type="button"
              disabled={!editable}
              onClick={() =>
                patch((c) => ({ ...c, fatePoints: c.fatePoints + 1 }))
              }
            >
              +
            </button>
          </div>
        </div>

        <label className="refresh-field">
          Refresh
          <input
            type="number"
            min={0}
            value={character.refresh}
            disabled={!editable}
            onChange={(e) =>
              patch((c) => ({
                ...c,
                refresh: Number(e.target.value) || 0,
              }))
            }
          />
        </label>
      </div>
    </section>
  );
}

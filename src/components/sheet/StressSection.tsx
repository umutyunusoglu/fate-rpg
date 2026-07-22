import type { Character, StressTrack } from "../../model/character";

interface StressTrackEditorProps {
  label: string;
  track: StressTrack;
  editable: boolean;
  onChange: (track: StressTrack) => void;
}

function StressTrackEditor({
  label,
  track,
  editable,
  onChange,
}: StressTrackEditorProps) {
  return (
    <div className="stress-track">
      <div className="stress-track-header">
        <span>{label}</span>
        {editable && (
          <div className="stepper">
            <button
              type="button"
              onClick={() =>
                onChange({ boxes: track.boxes.slice(0, -1) })
              }
              disabled={track.boxes.length <= 1}
              title="Remove box"
            >
              -
            </button>
            <span className="stepper-value">{track.boxes.length}</span>
            <button
              type="button"
              onClick={() => onChange({ boxes: [...track.boxes, false] })}
              title="Add box"
            >
              +
            </button>
          </div>
        )}
      </div>
      <div className="stress-boxes">
        {track.boxes.map((checked, i) => (
          <label className="stress-box" key={i}>
            <input
              type="checkbox"
              checked={checked}
              disabled={!editable}
              onChange={(e) => {
                const boxes = track.boxes.slice();
                boxes[i] = e.target.checked;
                onChange({ boxes });
              }}
            />
            <span>{i + 1}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

interface StressSectionProps {
  character: Character;
  editable: boolean;
  patch: (updater: (c: Character) => Character) => void;
}

export function StressSection({
  character,
  editable,
  patch,
}: StressSectionProps) {
  return (
    <section className="sheet-section">
      <h2>Stress</h2>
      <StressTrackEditor
        label="Physical / Physique"
        track={character.physicalStress}
        editable={editable}
        onChange={(track) => patch((c) => ({ ...c, physicalStress: track }))}
      />
      <StressTrackEditor
        label="Mental / Will"
        track={character.mentalStress}
        editable={editable}
        onChange={(track) => patch((c) => ({ ...c, mentalStress: track }))}
      />
    </section>
  );
}

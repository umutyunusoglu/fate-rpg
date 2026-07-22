import { useState } from "react";
import type { Character } from "../../model/character";
import { downloadCharacterJson } from "../../import/json";
import { ConfirmDialog } from "../ConfirmDialog";
import { IdentitySection } from "./IdentitySection";
import { AspectsSection } from "./AspectsSection";
import { SkillsSection } from "./SkillsSection";
import { StuntsSection } from "./StuntsSection";
import { StressSection } from "./StressSection";
import { ConsequencesSection } from "./ConsequencesSection";
import { EquipmentSection } from "./EquipmentSection";

interface SheetEditorProps {
  character: Character;
  editable: boolean;
  onUpdate: (updater: (c: Character) => Character) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export function SheetEditor({
  character,
  editable,
  onUpdate,
  onDelete,
  onClose,
}: SheetEditorProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <div className="sheet-editor">
      <div className="sheet-editor-header">
        <button type="button" onClick={onClose} className="link">
          &larr; Back to roster
        </button>
        <div className="sheet-editor-header-actions">
          <button type="button" onClick={() => downloadCharacterJson(character)}>
            Export JSON
          </button>
          {onDelete && (
            <button
              type="button"
              className="danger"
              onClick={() => setConfirmingDelete(true)}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {!editable && (
        <div className="readonly-banner">
          You can view this sheet but only its owner (or the GM) can edit it.
        </div>
      )}

      <IdentitySection character={character} editable={editable} patch={onUpdate} />
      <AspectsSection character={character} editable={editable} patch={onUpdate} />
      <SkillsSection character={character} editable={editable} patch={onUpdate} />
      <StuntsSection character={character} editable={editable} patch={onUpdate} />
      <StressSection character={character} editable={editable} patch={onUpdate} />
      <ConsequencesSection character={character} editable={editable} patch={onUpdate} />
      <EquipmentSection character={character} editable={editable} patch={onUpdate} />

      {confirmingDelete && onDelete && (
        <ConfirmDialog
          title="Delete character"
          message={`Delete "${character.name || "Unnamed character"}"? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => {
            setConfirmingDelete(false);
            onDelete();
          }}
        />
      )}
    </div>
  );
}

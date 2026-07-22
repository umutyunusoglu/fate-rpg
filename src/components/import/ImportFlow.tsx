import { useRef, useState } from "react";
import type { Character } from "../../model/character";
import { parseCharacterJsonFile } from "../../import/json";
import {
  looksLikeUnrecognizedFateCorePdf,
  parseFateCorePdf,
} from "../../import/pdf";
import { useCharacters } from "../../hooks/CharactersProvider";
import type { PlayerInfo } from "../../hooks/usePlayer";
import { SheetEditor } from "../sheet/SheetEditor";

interface ImportFlowProps {
  player: PlayerInfo;
  onDone: () => void;
}

export function ImportFlow({ player, onDone }: ImportFlowProps) {
  const { addCharacter } = useCharacters();
  const [draft, setDraft] = useState<Character | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const jsonInput = useRef<HTMLInputElement>(null);
  const pdfInput = useRef<HTMLInputElement>(null);

  async function handleJsonFile(file: File) {
    setError(null);
    setWarning(null);
    try {
      const text = await file.text();
      setDraft(parseCharacterJsonFile(text, player.id));
    } catch (e) {
      setError(
        `Could not read that JSON file: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  async function handlePdfFile(file: File) {
    setError(null);
    setWarning(null);
    try {
      const parsed = await parseFateCorePdf(file, player.id);
      if (looksLikeUnrecognizedFateCorePdf(parsed)) {
        setWarning(
          "This doesn't look like the official Fate Core template -- none of the expected fields (Name, Aspect 1/2, Skill 1-26, ...) were found. You can still edit the fields below by hand, or double-check you uploaded the right PDF.",
        );
      }
      setDraft(parsed);
    } catch (e) {
      setError(
        `Could not read that PDF file: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  if (draft) {
    return (
      <div className="import-review">
        {warning && <div className="roster-warning">{warning}</div>}
        <div className="import-review-banner">
          Review the imported character below, then save it. Nothing is
          added to the room until you save.
        </div>
        <SheetEditor
          character={draft}
          editable
          onUpdate={(updater) => setDraft((d) => (d ? updater(d) : d))}
          onClose={() => setDraft(null)}
        />
        <div className="import-review-actions">
          <button type="button" onClick={() => setDraft(null)}>
            Discard
          </button>
          <button
            type="button"
            className="primary"
            onClick={() => {
              addCharacter(draft);
              onDone();
            }}
          >
            Save character
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="import-chooser">
      <h1>Import character</h1>

      {error && <div className="roster-warning">{error}</div>}

      <section className="sheet-section">
        <h2>From this tool's JSON export</h2>
        <p className="import-hint">
          Load a character previously exported from this extension.
        </p>
        <input
          ref={jsonInput}
          type="file"
          accept="application/json,.json"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleJsonFile(file);
            e.target.value = "";
          }}
        />
      </section>

      <section className="sheet-section">
        <h2>From the official Fate Core PDF</h2>
        <p className="import-hint">
          Upload the official Fate Core form-fillable character sheet PDF.
          Fields are mapped automatically; you'll get a chance to review
          and fix anything before saving.
        </p>
        <input
          ref={pdfInput}
          type="file"
          accept="application/pdf,.pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handlePdfFile(file);
            e.target.value = "";
          }}
        />
      </section>

      <button type="button" onClick={onDone}>
        Cancel
      </button>
    </div>
  );
}

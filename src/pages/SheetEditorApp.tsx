import { useMemo } from "react";
import { CharactersProvider, useCharacters } from "../hooks/CharactersProvider";
import { usePlayer } from "../hooks/usePlayer";
import { useApplyObrTheme } from "../hooks/useTheme";
import { canEdit } from "../obr/roles";
import { closeSheetModal } from "../obr/modal";
import { SheetEditor } from "../components/sheet/SheetEditor";
import { ImportFlow } from "../components/import/ImportFlow";

function useQueryParams() {
  return useMemo(() => new URLSearchParams(window.location.search), []);
}

function EditRoute({ id, playerRole, playerId }: { id: string; playerRole: "GM" | "PLAYER"; playerId: string }) {
  const { characters, loading, updateCharacter, deleteCharacter } = useCharacters();
  const character = characters[id];

  if (loading) {
    return <div className="roster-empty">Loading...</div>;
  }

  if (!character) {
    return (
      <div className="roster-empty">
        This character no longer exists (it may have been deleted by
        someone else).
        <div style={{ marginTop: 8 }}>
          <button type="button" onClick={() => void closeSheetModal()}>
            Close
          </button>
        </div>
      </div>
    );
  }

  const editable = canEdit(character, playerRole, playerId);

  return (
    <SheetEditor
      character={character}
      editable={editable}
      onUpdate={(updater) => updateCharacter(id, updater)}
      onDelete={
        editable || playerRole === "GM"
          ? () => {
              deleteCharacter(id);
              void closeSheetModal();
            }
          : undefined
      }
      onClose={() => void closeSheetModal()}
    />
  );
}

function SheetEditorApp() {
  useApplyObrTheme();
  const player = usePlayer();
  const params = useQueryParams();

  if (!player) {
    return <div className="roster-empty">Connecting to Owlbear...</div>;
  }

  const mode = params.get("mode");
  const id = params.get("id");

  return (
    <CharactersProvider>
      {mode === "import" ? (
        <ImportFlow player={player} onDone={() => void closeSheetModal()} />
      ) : id ? (
        <EditRoute id={id} playerRole={player.role} playerId={player.id} />
      ) : (
        <div className="roster-empty">No character specified.</div>
      )}
    </CharactersProvider>
  );
}

export default SheetEditorApp;

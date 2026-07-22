import { useCharacters } from "../hooks/CharactersProvider";
import type { PlayerInfo } from "../hooks/usePlayer";
import { canEdit } from "../obr/roles";
import { SheetEditor } from "../components/sheet/SheetEditor";

interface SheetRouteProps {
  id: string;
  player: PlayerInfo;
  onBack: () => void;
}

export function SheetRoute({ id, player, onBack }: SheetRouteProps) {
  const { characters, loading, updateCharacter, deleteCharacter } =
    useCharacters();
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
          <button type="button" onClick={onBack}>
            Back to roster
          </button>
        </div>
      </div>
    );
  }

  const editable = canEdit(character, player.role, player.id);

  return (
    <SheetEditor
      character={character}
      editable={editable}
      onUpdate={(updater) => updateCharacter(id, updater)}
      onDelete={
        editable || player.role === "GM"
          ? () => {
              deleteCharacter(id);
              onBack();
            }
          : undefined
      }
      onClose={onBack}
    />
  );
}

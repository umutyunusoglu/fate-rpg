import type { Player } from "@owlbear-rodeo/sdk";
import { useMemo } from "react";
import { useCharacters } from "../hooks/CharactersProvider";
import type { PlayerInfo } from "../hooks/usePlayer";
import { usePartyPlayers } from "../hooks/useParty";
import { openImportModal, openSheetModal } from "../obr/modal";
import { METADATA_WARNING_BYTES } from "../obr/metadata";
import { CharacterCard } from "./CharacterCard";

interface RosterProps {
  player: PlayerInfo;
}

export function Roster({ player }: RosterProps) {
  const {
    characters,
    loading,
    sizeBytes,
    createCharacter,
    deleteCharacter,
    duplicateCharacter,
    assignOwner,
  } = useCharacters();
  const otherPlayers = usePartyPlayers();

  const allPlayers = useMemo<Player[]>(() => {
    const self: Player = {
      id: player.id,
      connectionId: "",
      role: player.role,
      name: player.name,
      color: "",
      syncView: false,
      metadata: {},
    };
    // OBR.party.getPlayers() is documented to exclude the local player, but
    // dedupe defensively in case that ever changes.
    return [self, ...otherPlayers.filter((p) => p.id !== player.id)];
  }, [player, otherPlayers]);

  const list = useMemo(
    () =>
      Object.values(characters).sort((a, b) => a.createdAt - b.createdAt),
    [characters],
  );

  if (loading) {
    return <div className="roster-empty">Loading characters...</div>;
  }

  return (
    <div className="roster">
      <div className="roster-header">
        <h1>Fate Sheets</h1>
        <div className="roster-header-actions">
          <button type="button" onClick={openImportModal}>
            Import
          </button>
          <button
            type="button"
            className="primary"
            onClick={() => {
              const created = createCharacter(player.id);
              void openSheetModal(created.id);
            }}
          >
            New character
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="roster-empty">
          No characters yet. Create a blank sheet or import one to get
          started.
        </div>
      ) : (
        <div className="roster-list">
          {list.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              role={player.role}
              playerId={player.id}
              players={allPlayers}
              onOpen={() => openSheetModal(character.id)}
              onDuplicate={() => duplicateCharacter(character.id, player.id)}
              onDelete={() => deleteCharacter(character.id)}
              onAssign={(ownerId) => assignOwner(character.id, ownerId)}
            />
          ))}
        </div>
      )}

      {sizeBytes > METADATA_WARNING_BYTES && (
        <div className="roster-warning">
          Character data is getting large ({Math.round(sizeBytes / 1024)} KB).
          Owlbear caps room metadata size -- consider trimming descriptions
          or removing unused characters.
        </div>
      )}
    </div>
  );
}

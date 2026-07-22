import { useState } from "react";
import type { Player } from "@owlbear-rodeo/sdk";
import type { Character } from "../model/character";
import { canDelete } from "../obr/roles";
import { ConfirmDialog } from "./ConfirmDialog";

interface CharacterCardProps {
  character: Character;
  role: "GM" | "PLAYER";
  playerId: string;
  players: Player[];
  onOpen: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onAssign: (ownerId: string | null) => void;
}

function ownerLabel(character: Character, playerId: string, players: Player[]) {
  if (!character.ownerId) return "Unassigned";
  if (character.ownerId === playerId) return "You";
  const match = players.find((p) => p.id === character.ownerId);
  return match ? match.name : "Offline player";
}

export function CharacterCard({
  character,
  role,
  playerId,
  players,
  onOpen,
  onDuplicate,
  onDelete,
  onAssign,
}: CharacterCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const deletable = canDelete(character, role, playerId);

  return (
    <div className="character-card">
      {character.avatarUrl ? (
        <img
          className="character-avatar"
          src={character.avatarUrl}
          alt=""
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="character-avatar placeholder" aria-hidden="true">
          {character.name.trim().charAt(0).toUpperCase() || "?"}
        </div>
      )}

      <div className="character-info">
        <button type="button" className="character-name link" onClick={onOpen}>
          {character.name || "Unnamed character"}
        </button>
        <div className="character-subtitle">
          {character.highConcept.title || "No high concept set"}
        </div>
        <div className="character-owner">
          Owner: {ownerLabel(character, playerId, players)}
        </div>
      </div>

      <div className="character-actions">
        {role === "GM" && (
          <select
            aria-label="Assign owner"
            value={character.ownerId ?? ""}
            onChange={(e) => onAssign(e.target.value || null)}
          >
            <option value="">Unassigned</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
        <button type="button" onClick={onDuplicate} title="Duplicate">
          Duplicate
        </button>
        {deletable && (
          <button
            type="button"
            className="danger"
            onClick={() => setConfirmingDelete(true)}
            title="Delete"
          >
            Delete
          </button>
        )}
      </div>

      {confirmingDelete && (
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

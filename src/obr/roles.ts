import type { Character } from "../model/character";

/**
 * Ownership is a UX convenience, not a security boundary: OBR room metadata
 * is readable and writable by anyone connected to the room, so a determined
 * player could edit another player's sheet directly via the SDK/devtools.
 * We gate editing in the UI (disable inputs, hide destructive actions) to
 * keep normal play honest, but this is not access control.
 */
export function canEdit(
  character: Character,
  role: "GM" | "PLAYER",
  playerId: string,
): boolean {
  if (role === "GM") return true;
  return character.ownerId === playerId;
}

/** GM may delete any sheet; a player may delete only sheets they own. */
export function canDelete(
  character: Character,
  role: "GM" | "PLAYER",
  playerId: string,
): boolean {
  if (role === "GM") return true;
  return character.ownerId === playerId;
}

export function canAssignOwner(role: "GM" | "PLAYER"): boolean {
  return role === "GM";
}

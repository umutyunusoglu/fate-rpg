import OBR from "@owlbear-rodeo/sdk";
import type { Character } from "../model/character";

/** Namespaced room metadata key holding every character in the room. */
export const CHARACTERS_METADATA_KEY = "com.fate-rpg.fate-sheets/characters";

export type CharacterMap = Record<string, Character>;

/**
 * Owlbear enforces a total size cap on room metadata (a few hundred KB,
 * shared across every extension in the room -- not just this one). We keep
 * this well under that by storing avatars as plain URLs rather than
 * embedded/base64 image data, and by warning the GM in the UI if the
 * serialized character list gets uncomfortably large.
 *
 * If a campaign ever has enough characters (or enough per-character detail)
 * to approach the cap, the fix is to switch from one big
 * `CHARACTERS_METADATA_KEY` blob to one metadata key per character
 * (`${CHARACTERS_METADATA_KEY}/${id}`). That lets OBR replace a single
 * character's entry instead of rewriting the whole roster on every edit,
 * at the cost of no longer being able to read/write the full roster
 * atomically in one call. Not implemented here since a typical party
 * (a handful of characters) stays far below the threshold.
 */
export const METADATA_WARNING_BYTES = 100_000;

export function readCharacters(metadata: Record<string, unknown>): CharacterMap {
  const raw = metadata[CHARACTERS_METADATA_KEY];
  if (raw && typeof raw === "object") {
    return raw as CharacterMap;
  }
  return {};
}

export function estimateSize(characters: CharacterMap): number {
  return new TextEncoder().encode(JSON.stringify(characters)).length;
}

export async function writeCharacters(characters: CharacterMap): Promise<void> {
  await OBR.room.setMetadata({ [CHARACTERS_METADATA_KEY]: characters });
}

export async function getInitialCharacters(): Promise<CharacterMap> {
  const metadata = await OBR.room.getMetadata();
  return readCharacters(metadata);
}

/** Returns an unsubscribe function, matching OBR's callback-in/off-out convention. */
export function subscribeCharacters(
  callback: (characters: CharacterMap) => void,
): () => void {
  return OBR.room.onMetadataChange((metadata) => {
    callback(readCharacters(metadata));
  });
}

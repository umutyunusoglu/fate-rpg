import OBR from "@owlbear-rodeo/sdk";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type Character,
  createBlankCharacter,
  duplicateCharacter as duplicateCharacterModel,
} from "../model/character";
import {
  type CharacterMap,
  estimateSize,
  getInitialCharacters,
  subscribeCharacters,
  writeCharacters,
} from "../obr/metadata";

/**
 * Typing in a text field would otherwise fire an OBR.room.setMetadata call
 * per keystroke. We debounce writes so a burst of local edits collapses
 * into a single network round trip once the user pauses.
 */
const WRITE_DEBOUNCE_MS = 500;

interface CharactersContextValue {
  characters: CharacterMap;
  loading: boolean;
  sizeBytes: number;
  createCharacter: (ownerId: string | null) => Character;
  addCharacter: (character: Character) => void;
  updateCharacter: (id: string, updater: (c: Character) => Character) => void;
  deleteCharacter: (id: string) => void;
  duplicateCharacter: (id: string, ownerId: string | null) => Character | null;
  assignOwner: (id: string, ownerId: string | null) => void;
}

const CharactersContext = createContext<CharactersContextValue | null>(null);

export function CharactersProvider({ children }: { children: React.ReactNode }) {
  const [characters, setCharacters] = useState<CharacterMap>({});
  const [loading, setLoading] = useState(true);

  // Character ids with local edits not yet confirmed by our own write.
  // While an id is "dirty" we ignore incoming onMetadataChange updates for
  // it, so a slower remote echo (or another client's stale broadcast that
  // raced ours) can't stomp on keystrokes the user just made.
  const dirtyIds = useRef<Set<string>>(new Set());
  const pendingWrite = useRef<CharacterMap | null>(null);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    // See usePlayer.ts for why this guard is needed: without it, a
    // StrictMode dev double-mount would leave an orphaned subscription
    // whenever cleanup fires before OBR.onReady's callback resolves.
    let cancelled = false;
    OBR.onReady(async () => {
      const initial = await getInitialCharacters();
      if (cancelled) return;
      setCharacters(initial);
      setLoading(false);
      unsub = subscribeCharacters((incoming) => {
        setCharacters((prev) => {
          const merged: CharacterMap = { ...incoming };
          for (const id of dirtyIds.current) {
            if (prev[id]) merged[id] = prev[id];
          }
          return merged;
        });
      });
    });
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  const flush = useCallback(async (ids: string[], toWrite: CharacterMap) => {
    try {
      await writeCharacters(toWrite);
    } finally {
      for (const id of ids) dirtyIds.current.delete(id);
    }
  }, []);

  const scheduleFlush = useCallback(
    (immediate: boolean) => {
      if (flushTimer.current) {
        clearTimeout(flushTimer.current);
        flushTimer.current = null;
      }
      const run = () => {
        flushTimer.current = null;
        const toWrite = pendingWrite.current;
        if (!toWrite) return;
        pendingWrite.current = null;
        void flush(Array.from(dirtyIds.current), toWrite);
      };
      if (immediate) run();
      else flushTimer.current = setTimeout(run, WRITE_DEBOUNCE_MS);
    },
    [flush],
  );

  const commit = useCallback(
    (next: CharacterMap, immediate = false) => {
      pendingWrite.current = next;
      scheduleFlush(immediate);
    },
    [scheduleFlush],
  );

  const updateCharacter = useCallback(
    (id: string, updater: (c: Character) => Character) => {
      setCharacters((prev) => {
        const existing = prev[id];
        if (!existing) return prev;
        const updated = { ...updater(existing), id, updatedAt: Date.now() };
        const next = { ...prev, [id]: updated };
        dirtyIds.current.add(id);
        commit(next);
        return next;
      });
    },
    [commit],
  );

  const createCharacter = useCallback(
    (ownerId: string | null) => {
      const character = createBlankCharacter(ownerId);
      setCharacters((prev) => {
        const next = { ...prev, [character.id]: character };
        commit(next, true);
        return next;
      });
      return character;
    },
    [commit],
  );

  const addCharacter = useCallback(
    (character: Character) => {
      setCharacters((prev) => {
        const next = { ...prev, [character.id]: character };
        commit(next, true);
        return next;
      });
    },
    [commit],
  );

  const deleteCharacter = useCallback(
    (id: string) => {
      setCharacters((prev) => {
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        dirtyIds.current.delete(id);
        commit(next, true);
        return next;
      });
    },
    [commit],
  );

  const duplicateCharacterFn = useCallback(
    (id: string, ownerId: string | null): Character | null => {
      let created: Character | null = null;
      setCharacters((prev) => {
        const source = prev[id];
        if (!source) return prev;
        created = duplicateCharacterModel(source, ownerId);
        const next = { ...prev, [created.id]: created };
        commit(next, true);
        return next;
      });
      return created;
    },
    [commit],
  );

  const assignOwner = useCallback(
    (id: string, ownerId: string | null) => {
      updateCharacter(id, (c) => ({ ...c, ownerId }));
    },
    [updateCharacter],
  );

  const sizeBytes = useMemo(() => estimateSize(characters), [characters]);

  const value = useMemo<CharactersContextValue>(
    () => ({
      characters,
      loading,
      sizeBytes,
      createCharacter,
      addCharacter,
      updateCharacter,
      deleteCharacter,
      duplicateCharacter: duplicateCharacterFn,
      assignOwner,
    }),
    [
      characters,
      loading,
      sizeBytes,
      createCharacter,
      addCharacter,
      updateCharacter,
      deleteCharacter,
      duplicateCharacterFn,
      assignOwner,
    ],
  );

  return (
    <CharactersContext.Provider value={value}>
      {children}
    </CharactersContext.Provider>
  );
}

export function useCharacters(): CharactersContextValue {
  const ctx = useContext(CharactersContext);
  if (!ctx) {
    throw new Error("useCharacters must be used within a CharactersProvider");
  }
  return ctx;
}

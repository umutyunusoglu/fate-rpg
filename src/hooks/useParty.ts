import { useEffect, useState } from "react";
import OBR from "@owlbear-rodeo/sdk";
import type { Player } from "@owlbear-rodeo/sdk";

/** Currently-connected players in the room, for owner-assignment and display. */
export function usePartyPlayers(): Player[] {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    let cancelled = false;
    OBR.onReady(async () => {
      const initial = await OBR.party.getPlayers();
      if (cancelled) return;
      setPlayers(initial);
      unsub = OBR.party.onChange(setPlayers);
    });
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  return players;
}

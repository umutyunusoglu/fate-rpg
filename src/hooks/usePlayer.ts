import { useEffect, useState } from "react";
import OBR from "@owlbear-rodeo/sdk";

export interface PlayerInfo {
  id: string;
  role: "GM" | "PLAYER";
  name: string;
}

/** Tracks the current player's OBR id, room role (GM vs PLAYER), and display name. */
export function usePlayer(): PlayerInfo | null {
  const [player, setPlayer] = useState<PlayerInfo | null>(null);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    // `cancelled` guards against React StrictMode's mount->cleanup->remount
    // cycle: if cleanup runs before OBR.onReady's async callback resolves,
    // we must not subscribe at all, or that subscription would never be
    // torn down (the cleanup closure has already run by the time `unsub`
    // gets assigned).
    let cancelled = false;
    OBR.onReady(async () => {
      const [id, role, name] = await Promise.all([
        OBR.player.getId(),
        OBR.player.getRole(),
        OBR.player.getName(),
      ]);
      if (cancelled) return;
      setPlayer({ id, role, name });
      unsub = OBR.player.onChange((p) =>
        setPlayer({ id: p.id, role: p.role, name: p.name }),
      );
    });
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  return player;
}

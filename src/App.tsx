import OBR from "@owlbear-rodeo/sdk";
import { useEffect, useState } from "react";
import { CharactersProvider } from "./hooks/CharactersProvider";
import { usePlayer } from "./hooks/usePlayer";
import { Roster } from "./components/Roster";
import { ImportFlow } from "./components/import/ImportFlow";
import { SheetRoute } from "./pages/SheetRoute";

type View =
  | { type: "roster" }
  | { type: "sheet"; id: string }
  | { type: "import" };

/**
 * The action popover is a persistent panel anchored to the toolbar -- it
 * does not block the scene the way OBR.modal's overlay does, so the whole
 * app (roster + sheet editor + import) lives inside this one popover and
 * just resizes itself per view, instead of opening a separate modal.
 */
const SIZES: Record<View["type"], { width: number; height: number }> = {
  roster: { width: 380, height: 560 },
  sheet: { width: 480, height: 720 },
  import: { width: 480, height: 640 },
};

function useResizeActionPopover(viewType: View["type"]) {
  useEffect(() => {
    const { width, height } = SIZES[viewType];
    void OBR.action.setWidth(width);
    void OBR.action.setHeight(height);
  }, [viewType]);
}

function App() {
  const player = usePlayer();
  const [view, setView] = useState<View>({ type: "roster" });

  useResizeActionPopover(view.type);

  if (!player) {
    return <div className="roster-empty">Connecting to Owlbear...</div>;
  }

  return (
    <CharactersProvider>
      {view.type === "roster" && (
        <Roster
          player={player}
          onOpenCharacter={(id) => setView({ type: "sheet", id })}
          onImport={() => setView({ type: "import" })}
        />
      )}
      {view.type === "sheet" && (
        <SheetRoute
          id={view.id}
          player={player}
          onBack={() => setView({ type: "roster" })}
        />
      )}
      {view.type === "import" && (
        <ImportFlow player={player} onDone={() => setView({ type: "roster" })} />
      )}
    </CharactersProvider>
  );
}

export default App;

import { CharactersProvider } from "./hooks/CharactersProvider";
import { usePlayer } from "./hooks/usePlayer";
import { useApplyObrTheme } from "./hooks/useTheme";
import { Roster } from "./components/Roster";

function App() {
  useApplyObrTheme();
  const player = usePlayer();

  if (!player) {
    return <div className="roster-empty">Connecting to Owlbear...</div>;
  }

  return (
    <CharactersProvider>
      <Roster player={player} />
    </CharactersProvider>
  );
}

export default App;

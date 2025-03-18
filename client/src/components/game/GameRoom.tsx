import { useGame } from "@/hooks/use-game";
import { Card } from "@/components/ui/card";
import { DiceRoller } from "./DiceRoller";
import { CharacterSheet } from "../character/CharacterSheet";
import { GMDashboard } from "./GMDashboard";
import { useAuth } from "@/hooks/use-auth";

export function GameRoom() {
  const { currentRoom, characters } = useGame();
  const { user } = useAuth();

  if (!currentRoom || !user) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      <div className="md:col-span-2">
        {user.isGameMaster ? (
          <GMDashboard roomId={currentRoom.id} />
        ) : (
          <CharacterSheet
            character={characters.find((c) => c.userId === user.id)}
          />
        )}
      </div>
      <div className="space-y-4">
        <Card className="p-4">
          <h2 className="text-xl font-bold mb-4">{currentRoom.name}</h2>
          <DiceRoller />
        </Card>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { useGame } from "@/hooks/use-game";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";

const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100];

export function DiceRoller() {
  const { rollDice } = useGame();

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-slate-800/50 backdrop-blur-sm">
      <h3 className="text-lg gaming-header">Lancer de Dés</h3>
      <div className="grid grid-cols-3 gap-2">
        {DICE_TYPES.map((type) => (
          <Button
            key={type}
            variant="outline"
            onClick={() => rollDice(type)}
            className="dice-button flex items-center gap-2"
          >
            <Dice6 className="w-4 h-4 text-blue-400" />
            d{type}
          </Button>
        ))}
      </div>
    </div>
  );
}
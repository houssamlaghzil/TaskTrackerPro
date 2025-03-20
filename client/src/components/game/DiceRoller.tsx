import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/hooks/use-game";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";
import { CriticalEffects } from "./CriticalEffects";

const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100];

export function DiceRoller() {
  const { rollDice } = useGame();
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [showEffect, setShowEffect] = useState(false);
  const [effectType, setEffectType] = useState<'success' | 'failure'>('success');

  const handleRoll = async (type: number) => {
    const result = await rollDice(type);
    setLastRoll(result);

    if (type === 20) {
      if (result === 20) {
        setEffectType('success');
        setShowEffect(true);
      } else if (result === 1) {
        setEffectType('failure');
        setShowEffect(true);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-slate-800/50 backdrop-blur-sm">
      <h3 className="text-lg gaming-header">Lancer de Dés</h3>

      {lastRoll && (
        <div className={`text-center text-2xl font-bold mb-4 ${
          lastRoll === 20 ? 'text-pastel-green' :
          lastRoll === 1 ? 'text-pastel-red' :
          'text-primary'
        }`}>
          {lastRoll}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {DICE_TYPES.map((type) => (
          <Button
            key={type}
            variant="outline"
            onClick={() => handleRoll(type)}
            className="dice-button flex items-center gap-2"
          >
            <Dice6 className="w-4 h-4 text-blue-400" />
            d{type}
          </Button>
        ))}
      </div>

      {showEffect && (
        <CriticalEffects
          type={effectType}
          onComplete={() => setShowEffect(false)}
        />
      )}
    </div>
  );
}
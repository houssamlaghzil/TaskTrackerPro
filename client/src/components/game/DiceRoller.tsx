import { Button } from "@/components/ui/button";
import { useGame } from "@/hooks/use-game";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";
import { useState, useEffect } from "react";
import ReactConfetti from "react-confetti";

const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100];
const ANIMATION_DURATION = 1000; // 1 seconde
const FACES = ['front', 'back', 'right', 'left', 'top', 'bottom'];

export function DiceRoller() {
  const { rollDice } = useGame();
  const [isRolling, setIsRolling] = useState(false);
  const [displayedResult, setDisplayedResult] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showDarkOverlay, setShowDarkOverlay] = useState(false);
  const [showCube, setShowCube] = useState(false);

  const animateRoll = async (diceType: number) => {
    setIsRolling(true);
    setDisplayedResult(null);
    setShowCube(true);

    // Animation de défilement des nombres et rotation du cube
    const startTime = Date.now();
    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < ANIMATION_DURATION) {
        setDisplayedResult(Math.floor(Math.random() * diceType) + 1);
        requestAnimationFrame(animate);
      } else {
        // Lancer réel du dé
        const result = Math.floor(Math.random() * diceType) + 1;
        setDisplayedResult(result);
        setIsRolling(false);
        setShowCube(false);

        // Effets spéciaux pour d20
        if (diceType === 20) {
          if (result === 20) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
          } else if (result === 1) {
            setShowDarkOverlay(true);
            setTimeout(() => setShowDarkOverlay(false), 3000);
          }
        }
      }
    };

    animate();
  };

  return (
    <>
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={500} />}
      {showDarkOverlay && (
        <div className="fixed inset-0 bg-black/80 pointer-events-none z-50 animate-fade-in" />
      )}
      <div className="flex flex-col gap-4 p-4 border rounded-lg bg-slate-800/50 backdrop-blur-sm">
        <h3 className="text-lg gaming-header">Lancer de Dés</h3>

        {showCube && (
          <div className="scene">
            <div className={`cube ${isRolling ? 'rolling' : ''}`}>
              {FACES.map((face) => (
                <div key={face} className={`face ${face}`}>
                  {displayedResult || '?'}
                </div>
              ))}
            </div>
          </div>
        )}

        {!showCube && displayedResult !== null && (
          <div className={`text-4xl font-bold text-center ${isRolling ? 'animate-bounce' : ''}`}>
            {displayedResult}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {DICE_TYPES.map((type) => (
            <Button
              key={type}
              variant="outline"
              onClick={() => animateRoll(type)}
              disabled={isRolling}
              className="dice-button flex items-center gap-2"
            >
              <Dice6 className="w-4 h-4 text-blue-400" />
              d{type}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}
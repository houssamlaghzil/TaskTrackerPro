import { createContext, ReactNode, useContext, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Character, GameRoom } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type GameContextType = {
  characters: Character[];
  rooms: GameRoom[];
  currentRoom: GameRoom | null;
  joinRoom: (room: GameRoom) => void;
  rollDice: (diceType: number) => void;
  createCharacter: (character: Partial<Character>) => void;
  createRoom: (room: Partial<GameRoom>) => void;
};

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);

  // Polling toutes les 3 secondes pour les mises à jour
  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: ["/api/characters"],
    refetchInterval: 3000,
  });

  const { data: rooms = [] } = useQuery<GameRoom[]>({
    queryKey: ["/api/rooms"],
    refetchInterval: 3000,
  });

  const createCharacterMutation = useMutation({
    mutationFn: async (character: Partial<Character>) => {
      const res = await apiRequest("POST", "/api/characters", character);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
      toast({
        title: "Character created",
        description: "Your character has been created successfully",
      });
    },
  });

  const createRoomMutation = useMutation({
    mutationFn: async (room: Partial<GameRoom>) => {
      const res = await apiRequest("POST", "/api/rooms", room);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      toast({
        title: "Room created",
        description: "Game room has been created successfully",
      });
    },
  });

  const rollDiceMutation = useMutation({
    mutationFn: async (diceType: number) => {
      const res = await apiRequest("POST", "/api/roll", { diceType });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Dice Roll",
        description: `You rolled a ${data.result}`,
      });
    },
  });

  return (
    <GameContext.Provider
      value={{
        characters,
        rooms,
        currentRoom,
        joinRoom: setCurrentRoom,
        rollDice: (diceType: number) => {
          if (!currentRoom) return;
          rollDiceMutation.mutate(diceType);
        },
        createCharacter: createCharacterMutation.mutate,
        createRoom: createRoomMutation.mutate,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
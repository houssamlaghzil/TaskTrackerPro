import { createContext, ReactNode, useContext, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Character, GameRoom, WebSocketMessage } from "@shared/schema";
import { useWebSocket } from "@/lib/useWebSocket";
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

  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: ["/api/characters"],
  });

  const { data: rooms = [] } = useQuery<GameRoom[]>({
    queryKey: ["/api/rooms"],
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

  const { sendMessage } = useWebSocket((message: WebSocketMessage) => {
    switch (message.type) {
      case "roll":
        toast({
          title: "Dice Roll",
          description: `${message.username} rolled a ${message.result} (d${message.diceType})`,
        });
        break;
      case "state_update":
        queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
        break;
    }
  });

  return (
    <GameContext.Provider
      value={{
        characters,
        rooms,
        currentRoom,
        joinRoom: setCurrentRoom,
        rollDice: (diceType) => {
          if (!currentRoom) return;
          const result = Math.floor(Math.random() * diceType) + 1;
          sendMessage({
            type: "roll",
            diceType,
            result,
            userId: currentRoom.id,
            username: "Player", // TODO: Get from auth context
          });
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

import { createContext, ReactNode, useContext, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Character, GameRoom } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./use-auth";

type GameContextType = {
  characters: Character[];
  rooms: GameRoom[];
  currentRoom: GameRoom | null;
  joinRoom: (room: GameRoom) => void;
  leaveRoom: () => void;
  rollDice: (diceType: number) => void;
  createCharacter: (character: Partial<Character>) => void;
  createRoom: (name: string) => void;
  isLoading: boolean;
};

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);

  // Polling toutes les 3 secondes pour les mises à jour
  const { data: rooms = [], isLoading: isLoadingRooms } = useQuery<GameRoom[]>({
    queryKey: ["/api/rooms"],
    refetchInterval: 3000,
  });

  const { data: characters = [], isLoading: isLoadingCharacters } = useQuery<Character[]>({
    queryKey: ["/api/rooms", currentRoom?.id, "characters"],
    enabled: !!currentRoom,
    queryFn: async () => {
      const res = await fetch(`/api/rooms/${currentRoom?.id}/characters`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch characters");
      return res.json();
    },
    refetchInterval: 3000,
  });

  const createCharacterMutation = useMutation({
    mutationFn: async (character: Partial<Character>) => {
      if (!currentRoom) throw new Error("No room selected");
      const res = await apiRequest(
        "POST",
        `/api/rooms/${currentRoom.id}/characters`,
        character
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/rooms", currentRoom?.id, "characters"],
      });
      toast({
        title: "Character created",
        description: "Your character has been created successfully",
      });
    },
  });

  const createRoomMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/rooms", { name });
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
        isLoading: isLoadingRooms || isLoadingCharacters,
        joinRoom: setCurrentRoom,
        leaveRoom: () => setCurrentRoom(null),
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
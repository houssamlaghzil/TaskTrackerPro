import { useGame } from "@/hooks/use-game";
import { useAuth } from "@/hooks/use-auth";
import { useRoute } from "wouter";
import { CharacterSheet } from "@/components/character/CharacterSheet";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function CharacterPage() {
  const [, params] = useRoute<{ roomId: string; characterId: string }>("/rooms/:roomId/characters/:characterId");
  const { user } = useAuth();

  const { data: room, isLoading: isLoadingRoom } = useQuery({
    queryKey: ["/api/rooms", params?.roomId],
    enabled: !!params?.roomId,
  });

  const { data: characters = [], isLoading: isLoadingCharacters } = useQuery({
    queryKey: ["/api/rooms", params?.roomId, "characters"],
    enabled: !!params?.roomId,
  });

  if (isLoadingRoom || isLoadingCharacters) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const character = characters.find(c => c.id === parseInt(params?.characterId || ""));

  if (!character) {
    return <div>Character not found</div>;
  }

  // Vérifier si l'utilisateur a le droit de voir ce personnage
  const canAccess = user?.isGameMaster || character.userId === user?.id;

  if (!canAccess) {
    return <div>You don't have permission to view this character</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <CharacterSheet character={character} />
    </div>
  );
}

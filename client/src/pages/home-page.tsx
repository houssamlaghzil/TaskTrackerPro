import { useGame } from "@/hooks/use-game";
import { GameRoom } from "@/components/game/GameRoom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { rooms, joinRoom, createRoom, currentRoom, isLoading } = useGame();
  const { user } = useAuth();

  if (currentRoom) {
    return <GameRoom />;
  }

  return (
    <div className="responsive-container p-4">
      <div className="responsive-flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold gaming-header">Salles de Jeu Disponibles</h1>
        {user?.isGameMaster && (
          <Button
            onClick={() =>
              createRoom(`Partie de ${user.username}`)
            }
            className="btn-hover"
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer une Salle
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : rooms.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground glass-panel">
          Aucune salle de jeu disponible. {user?.isGameMaster && "Créez-en une pour commencer !"}
        </Card>
      ) : (
        <div className="responsive-grid">
          {rooms.map((room) => (
            <Card
              key={room.id}
              className="p-4 cursor-pointer card-hover"
              onClick={() => joinRoom(room)}
            >
              <h3 className="font-bold gaming-header">{room.name}</h3>
              {room.gameMasterId === user?.id && (
                <span className="text-sm text-pastel-purple">(Maître du Jeu)</span>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
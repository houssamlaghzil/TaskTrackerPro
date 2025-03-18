import { useGame } from "@/hooks/use-game";
import { GameRoom } from "@/components/game/GameRoom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { rooms, joinRoom, createRoom, currentRoom } = useGame();
  const { user } = useAuth();

  if (currentRoom) {
    return <GameRoom />;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Available Game Rooms</h1>
        {user?.isGameMaster && (
          <Button
            onClick={() =>
              createRoom(`${user.username}'s Game`)
            }
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Room
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <Card
            key={room.id}
            className="p-4 cursor-pointer hover:bg-accent"
            onClick={() => joinRoom(room)}
          >
            <h3 className="font-bold">{room.name}</h3>
          </Card>
        ))}
      </div>
    </div>
  );
}
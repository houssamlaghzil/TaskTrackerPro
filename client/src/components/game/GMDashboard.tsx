import { useGame } from "@/hooks/use-game";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CharacterSheet } from "../character/CharacterSheet";
import { useState } from "react";

export function GMDashboard({ roomId }: { roomId: number }) {
  const { characters } = useGame();
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Game Master Dashboard</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Character
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create New Character</DialogTitle>
            </DialogHeader>
            <CharacterSheet />
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Character</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>HP</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {characters.map((character) => (
            <TableRow key={character.id}>
              <TableCell>{character.name}</TableCell>
              <TableCell>{character.class}</TableCell>
              <TableCell>{character.level}</TableCell>
              <TableCell>
                {character.hitPoints}/{character.maxHitPoints}
              </TableCell>
              <TableCell>
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCharacter(character)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Edit Character</DialogTitle>
                    </DialogHeader>
                    {selectedCharacter && (
                      <CharacterSheet character={selectedCharacter} />
                    )}
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
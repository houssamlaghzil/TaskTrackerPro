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
import { Link } from "wouter";

export function GMDashboard({ roomId }: { roomId: number }) {
  const { characters } = useGame();
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Tableau de Bord du Maître du Jeu</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="btn-hover">
              <Plus className="w-4 h-4 mr-2" />
              Créer un Personnage
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl dialog-content">
            <DialogHeader>
              <DialogTitle>Créer un Nouveau Personnage</DialogTitle>
            </DialogHeader>
            <CharacterSheet />
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Personnage</TableHead>
            <TableHead>Classe</TableHead>
            <TableHead>Niveau</TableHead>
            <TableHead>PV</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {characters.map((character) => (
            <TableRow key={character.id} className="table-row-hover">
              <TableCell>
                <Link href={`/rooms/${roomId}/characters/${character.id}`} className="link-hover text-primary">
                  {character.name}
                </Link>
              </TableCell>
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
                      className="btn-hover"
                      onClick={() => setSelectedCharacter(character)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl dialog-content">
                    <DialogHeader>
                      <DialogTitle>Modifier le Personnage</DialogTitle>
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
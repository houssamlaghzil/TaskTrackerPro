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
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CharacterSheet } from "../character/CharacterSheet";
import { useState } from "react";
import { Link } from "wouter";
import { translateClass } from "@/lib/translations";
import type { Character } from "@shared/schema";

export function GMDashboard({ roomId }: { roomId: number }) {
  const { characters } = useGame();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <Card className="p-4 card-fantasy">
      <div className="responsive-flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold gaming-header">Tableau de Bord du Maître du Jeu</h2>
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
              <DialogDescription>
                Remplissez le formulaire pour créer un nouveau personnage.
              </DialogDescription>
            </DialogHeader>
            <CharacterSheet />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg overflow-hidden border border-pastel-blue/30 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-pastel-blue/20">
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
                    <Link href={`/rooms/${roomId}/characters/${character.id}`} className="link-hover">
                      {character.name}
                    </Link>
                  </TableCell>
                  <TableCell>{translateClass(character.class)}</TableCell>
                  <TableCell>{character.level}</TableCell>
                  <TableCell className="hp-text">
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
                          <DialogDescription>
                            Modifiez les informations du personnage.
                          </DialogDescription>
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
        </div>
      </div>
    </Card>
  );
}
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

export function GMDashboard({ roomId }: { roomId: number }) {
  const { characters } = useGame();

  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold mb-4">Game Master Dashboard</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Character</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>HP</TableHead>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

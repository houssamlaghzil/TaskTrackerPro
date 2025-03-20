import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Character, insertCharacterSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useGame } from "@/hooks/use-game";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import { Inventory } from "./Inventory";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

const CLASSES = [
  "Barbarian",
  "Bard",
  "Cleric",
  "Druid",
  "Fighter",
  "Monk",
  "Paladin",
  "Ranger",
  "Rogue",
  "Sorcerer",
  "Warlock",
  "Wizard",
];

const RACES = [
  "Human",
  "Elf",
  "Dwarf",
  "Halfling",
  "Gnome",
  "Half-Elf",
  "Half-Orc",
  "Tiefling",
];

type StatBlockProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

function StatBlock({ label, value, onChange }: StatBlockProps) {
  const modifier = Math.floor((value - 10) / 2);

  return (
    <div className="stat-block">
      <label className="text-sm font-medium mb-2 gaming-header">{label}</label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-16 text-center mb-2 bg-slate-700/50 input-fantasy"
        min={1}
        max={20}
      />
      <span className={`text-sm ${modifier >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {modifier >= 0 ? `+${modifier}` : modifier}
      </span>
    </div>
  );
}

type Props = {
  character?: Character;
};

export function CharacterSheet({ character }: Props) {
  const { createCharacter } = useGame();
  const { toast } = useToast();

  const deleteCharacterMutation = useMutation({
    mutationFn: async (characterId: number) => {
      await apiRequest("DELETE", `/api/characters/${characterId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      toast({
        title: "Character deleted",
        description: "Your character has been deleted successfully",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(insertCharacterSchema),
    defaultValues: character || {
      name: "",
      race: "Human",
      class: "Fighter",
      level: 1,
      hitPoints: 10,
      maxHitPoints: 10,
      mana: 0,
      maxMana: 0,
      stamina: 100,
      maxStamina: 100,
      stats: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      },
      ultimateAttack: {
        name: "",
        description: "",
        damage: "",
        cooldown: "1 par repos long",
        isAvailable: true,
      },
    },
  });

  const onSubmit = (data: any) => {
    createCharacter(data);
  };

  return (
    <Card className="p-6 card-fantasy">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold gaming-header">Fiche de Personnage</h2>
        {character && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteCharacterMutation.mutate(character.id)}
            className="btn-hover"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Character Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="input-fantasy" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 1)
                        }
                        min={1}
                        max={20}
                        className="input-fantasy"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="race"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Race</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a race" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {RACES.map((race) => (
                          <SelectItem key={race} value={race}>
                            {race}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CLASSES.map((cls) => (
                          <SelectItem key={cls} value={cls}>
                            {cls}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="stats.strength"
                render={({ field }) => (
                  <StatBlock
                    label="Strength"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="stats.dexterity"
                render={({ field }) => (
                  <StatBlock
                    label="Dexterity"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="stats.constitution"
                render={({ field }) => (
                  <StatBlock
                    label="Constitution"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="stats.intelligence"
                render={({ field }) => (
                  <StatBlock
                    label="Intelligence"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="stats.wisdom"
                render={({ field }) => (
                  <StatBlock
                    label="Wisdom"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="stats.charisma"
                render={({ field }) => (
                  <StatBlock
                    label="Charisma"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hitPoints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="hp-text">Points de Vie Actuels</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                        className="input-fantasy"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxHitPoints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="hp-text">Points de Vie Maximum</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                        className="input-fantasy"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mana"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mana-text">Points de Mana Actuels</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                        className="input-fantasy"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxMana"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mana-text">Points de Mana Maximum</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                        className="input-fantasy"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stamina"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="stamina-text">Points d'Endurance Actuels</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                        className="input-fantasy"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxStamina"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="stamina-text">Points d'Endurance Maximum</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                        className="input-fantasy"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Card className="p-4 card-fantasy">
              <h3 className="text-lg font-bold mb-4 gaming-header">Attaque Ultime</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="ultimateAttack.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de l'Attaque</FormLabel>
                      <FormControl>
                        <Input {...field} className="input-fantasy" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ultimateAttack.description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="input-fantasy" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ultimateAttack.damage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dégâts</FormLabel>
                      <FormControl>
                        <Input {...field} className="input-fantasy" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ultimateAttack.cooldown"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temps de Recharge</FormLabel>
                      <FormControl>
                        <Input {...field} className="input-fantasy" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ultimateAttack.isAvailable"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FormLabel>Disponible</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {!character && (
              <Button type="submit" className="w-full btn-hover">
                Créer le Personnage
              </Button>
            )}
          </form>
        </Form>
        {character && (
          <div className="mt-8">
            <Inventory characterId={character.id} />
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
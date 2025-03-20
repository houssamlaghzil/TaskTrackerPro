import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { Trash2, Loader2 } from "lucide-react";
import { Inventory } from "./Inventory";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";

const CLASSES = [
  { value: "Barbarian", label: "Barbare" },
  { value: "Bard", label: "Barde" },
  { value: "Cleric", label: "Clerc" },
  { value: "Druid", label: "Druide" },
  { value: "Fighter", label: "Guerrier" },
  { value: "Monk", label: "Moine" },
  { value: "Paladin", label: "Paladin" },
  { value: "Ranger", label: "Rôdeur" },
  { value: "Rogue", label: "Roublard" },
  { value: "Sorcerer", label: "Ensorceleur" },
  { value: "Warlock", label: "Occultiste" },
  { value: "Wizard", label: "Magicien" },
];

const RACES = [
  { value: "Human", label: "Humain" },
  { value: "Elf", label: "Elfe" },
  { value: "Dwarf", label: "Nain" },
  { value: "Halfling", label: "Halfelin" },
  { value: "Gnome", label: "Gnome" },
  { value: "Half-Elf", label: "Demi-Elfe" },
  { value: "Half-Orc", label: "Demi-Orc" },
  { value: "Tiefling", label: "Tiefelin" },
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
        onChange={(e) => {
          const newValue = parseInt(e.target.value) || 0;
          if (newValue >= 1 && newValue <= 20) {
            onChange(newValue);
          }
        }}
        className="w-16 text-center mb-2 input-fantasy"
        min={1}
        max={20}
      />
      <span className={`text-sm ${modifier >= 0 ? 'text-pastel-green' : 'text-pastel-red'}`}>
        {modifier >= 0 ? `+${modifier}` : modifier}
      </span>
    </div>
  );
}

export function CharacterSheet({ character }: { character?: Character }) {
  const { createCharacter } = useGame();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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

  const deleteCharacterMutation = useMutation({
    mutationFn: async (characterId: number) => {
      const res = await apiRequest("DELETE", `/api/characters/${characterId}`);
      if (!res.ok) throw new Error("Erreur lors de la suppression du personnage");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      toast({
        title: "Personnage supprimé",
        description: "Le personnage a été supprimé avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCharacterMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!character?.id) throw new Error("ID du personnage manquant");

      const validatedData = insertCharacterSchema.parse(data);
      const res = await apiRequest(
        "PATCH",
        `/api/characters/${character.id}`,
        validatedData
      );

      if (!res.ok) throw new Error("Erreur lors de la mise à jour");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/rooms", character?.roomId, "characters"],
      });
      toast({
        title: "Succès",
        description: "Les modifications ont été enregistrées",
      });
      setError(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      setError(error.message);
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const validatedData = insertCharacterSchema.parse(data);
      await createCharacter(validatedData);
      setError(null);
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      requestAnimationFrame(() => {
        card.style.transform = `
          perspective(1000px)
          rotateY(${x * 5}deg)
          rotateX(${-y * 5}deg)
          translateZ(5px)
        `;
      });
    };

    const handleMouseLeave = () => {
      requestAnimationFrame(() => {
        card.style.transform = 'none';
      });
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const fixNumberInput = (value: number | null): number => {
    return value ?? 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card-fantasy"
    >
      <Card ref={cardRef} className="p-6 card-fantasy">
        {error && (
          <div className="mb-4 p-4 bg-pastel-red/20 border border-pastel-red rounded-lg text-red-600">
            {error}
          </div>
        )}

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
            <form
              onSubmit={form.handleSubmit(character ?
                (data) => updateCharacterMutation.mutate(data) :
                onSubmit
              )}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du Personnage</FormLabel>
                      <FormControl>
                        <Input {...field} className="input-fantasy" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niveau</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => {
                            try {
                              const value = parseInt(e.target.value) || 1;
                              if (value >= 1 && value <= 20) {
                                field.onChange(value);
                              }
                            } catch (error) {
                              console.error("Error updating level:", error);
                            }
                          }}
                          min={1}
                          max={20}
                          className="input-fantasy"
                        />
                      </FormControl>
                      <FormMessage />
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
                          <SelectTrigger className="input-fantasy">
                            <SelectValue placeholder="Sélectionner une race" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {RACES.map((race) => (
                            <SelectItem key={race.value} value={race.value}>
                              {race.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classe</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="input-fantasy">
                            <SelectValue placeholder="Sélectionner une classe" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CLASSES.map((cls) => (
                            <SelectItem key={cls.value} value={cls.value}>
                              {cls.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="responsive-grid">
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

              <div className="responsive-grid">
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
                      <FormMessage />
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
                      <FormMessage />
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
                          value={fixNumberInput(field.value)}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className="input-fantasy"
                        />
                      </FormControl>
                      <FormMessage />
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
                          value={fixNumberInput(field.value)}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className="input-fantasy"
                        />
                      </FormControl>
                      <FormMessage />
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
                          value={fixNumberInput(field.value)}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className="input-fantasy"
                        />
                      </FormControl>
                      <FormMessage />
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
                          value={fixNumberInput(field.value)}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className="input-fantasy"
                        />
                      </FormControl>
                      <FormMessage />
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
                        <FormMessage />
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
                        <FormMessage />
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
                        <FormMessage />
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
                        <FormMessage />
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
                        <FormMessage />
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
        {character && (
          <div className="flex justify-end gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                form.reset();
                setError(null);
              }}
              className="btn-hover"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              onClick={form.handleSubmit((data) => updateCharacterMutation.mutate(data))}
              className="btn-hover"
              disabled={updateCharacterMutation.isPending}
            >
              {updateCharacterMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Sauvegarder
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
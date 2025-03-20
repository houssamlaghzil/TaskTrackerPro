// Mapping des traductions pour les classes et races
export const CLASS_TRANSLATIONS: Record<string, string> = {
  "Barbarian": "Barbare",
  "Bard": "Barde",
  "Cleric": "Clerc",
  "Druid": "Druide",
  "Fighter": "Guerrier",
  "Monk": "Moine",
  "Paladin": "Paladin",
  "Ranger": "Rôdeur",
  "Rogue": "Roublard",
  "Sorcerer": "Ensorceleur",
  "Warlock": "Occultiste",
  "Wizard": "Magicien"
};

export const RACE_TRANSLATIONS: Record<string, string> = {
  "Human": "Humain",
  "Elf": "Elfe",
  "Dwarf": "Nain",
  "Halfling": "Halfelin",
  "Gnome": "Gnome",
  "Half-Elf": "Demi-Elfe",
  "Half-Orc": "Demi-Orc",
  "Tiefling": "Tiefelin"
};

export const translateClass = (className: string): string => {
  return CLASS_TRANSLATIONS[className] || className;
};

export const translateRace = (raceName: string): string => {
  return RACE_TRANSLATIONS[raceName] || raceName;
};

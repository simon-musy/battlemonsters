import type { Opponent } from '../types/game';

export const SHADOW_REAPER: Opponent = {
  character_name: "Shadow Reaper",
  description: "A dark entity from the void realm, wielding ancient necromantic powers and feeding on the life force of its enemies.",
  hp: 120,
  energy: 100,
  mana: 85,
  powers: [
    {
      name: "Soul Drain",
      description: "Drains life force from the enemy while restoring own HP",
      energy_cost: 25,
      cooldown: 4,
      damage_range: "20-35"
    },
    {
      name: "Shadow Strike",
      description: "A swift attack from the shadows that ignores armor",
      energy_cost: 20,
      cooldown: 3,
      damage_range: "15-30"
    },
    {
      name: "Void Blast",
      description: "Unleashes a devastating blast of dark energy",
      energy_cost: 40,
      cooldown: 6,
      damage_range: "35-50"
    }
  ],
  image_url: "https://i.ibb.co/HLNJNcKg/Gemini-Generated-Image-6tj37f6tj37f6tj3.jpg",
  image_prompt: "Dark hooded figure wreathed in shadows and purple energy, skeletal hands with glowing claws, tattered black robes flowing in supernatural wind, glowing red eyes piercing through darkness, necromantic aura, void energy swirling around, menacing presence, dark fantasy villain, gothic horror aesthetic"
};

// Export as default for easy importing
export const FIXED_OPPONENT = SHADOW_REAPER;

// Future opponents can be added here
export const OPPONENTS = {
  SHADOW_REAPER,
  // FIRE_DRAGON: { ... },
  // ICE_WITCH: { ... },
} as const;
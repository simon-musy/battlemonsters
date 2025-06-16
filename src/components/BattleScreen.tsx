import React, { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { BattleStoryScreen } from './BattleStoryScreen';
import { CharacterCard } from './ui/CharacterCard';
import { PowersList } from './ui/PowersList';
import { BattleHeader } from './ui/BattleHeader';
import { VSSection } from './ui/VSSection';
import type { Opponent } from '../types/game';

// Fixed opponent for now
const FIXED_OPPONENT: Opponent = {
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

export function BattleScreen() {
  const { state, dispatch } = useGame();
  const { character, isGeneratingImage, imageGenerationError, selectedPower } = state;
  const imageGenerationAttempted = useRef(false);

  // Image generation effect
  useEffect(() => {
    if (character && !character.image_url && !isGeneratingImage && !imageGenerationError && !imageGenerationAttempted.current) {
      imageGenerationAttempted.current = true;
      const generateImage = async () => {
        dispatch({ type: 'SET_GENERATING_IMAGE', payload: true });
        try {
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/character-image`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ prompt: character.image_prompt }),
            }
          );

          if (!response.ok) {
            throw new Error('Failed to generate image');
          }

          const data = await response.json();
          if (data.url) {
            dispatch({ type: 'SET_CHARACTER_IMAGE', payload: data.url });
          } else {
            throw new Error('No image URL returned');
          }
        } catch (error) {
          console.error('Failed to generate character image:', error);
          dispatch({ type: 'SET_IMAGE_GENERATION_ERROR', payload: true });
        } finally {
          dispatch({ type: 'SET_GENERATING_IMAGE', payload: false });
        }
      };

      generateImage();
    }
  }, [character, isGeneratingImage, imageGenerationError, dispatch]);

  // If a power is selected, show the battle story screen
  if (selectedPower !== undefined) {
    return <BattleStoryScreen />;
  }

  if (!character) return null;

  const handleAttackSelect = (powerIndex: number) => {
    dispatch({ type: 'SELECT_POWER', payload: powerIndex });
  };

  const handleRetryImageGeneration = () => {
    imageGenerationAttempted.current = false;
    dispatch({ type: 'SET_IMAGE_GENERATION_ERROR', payload: false });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <BattleHeader 
        title="Battle Arena" 
        subtitle="Choose your attack to begin the battle!" 
      />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Player Character */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-purple-200 text-center">Your Character</h3>
          <CharacterCard 
            character={character}
            isPlayer={true}
            isGeneratingImage={isGeneratingImage}
            imageGenerationError={imageGenerationError}
            onRetryImageGeneration={handleRetryImageGeneration}
          />
        </div>

        {/* VS Divider & Powers */}
        <div className="space-y-6">
          <VSSection />
          <PowersList 
            powers={character.powers}
            onPowerSelect={handleAttackSelect}
          />
        </div>

        {/* Opponent Character */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-red-200 text-center">Opponent</h3>
          <CharacterCard character={FIXED_OPPONENT} />
        </div>
      </div>
    </div>
  );
}
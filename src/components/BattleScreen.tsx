import React, { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { BattleStoryScreen } from './BattleStoryScreen';
import { CharacterCard } from './ui/CharacterCard';
import { PowersList } from './ui/PowersList';
import { BattleHeader } from './ui/BattleHeader';
import { VSSection } from './ui/VSSection';
import { FIXED_OPPONENT } from '../data/opponents';

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
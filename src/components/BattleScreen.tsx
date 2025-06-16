import React, { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { BattleStoryScreen } from './BattleStoryScreen';
import { CharacterCard } from './ui/CharacterCard';
import { PowersList } from './ui/PowersList';
import { BattleHeader } from './ui/BattleHeader';
import { VSSection } from './ui/VSSection';
import { getRandomOpponent } from '../data/opponents';
import { useImageGeneration } from '../hooks/useImageGeneration';

export function BattleScreen() {
  const { state, dispatch } = useGame();
  const { character, opponent, selectedPower } = state;
  const opponentSelected = useRef(false);
  const imageGeneration = useImageGeneration();

  // Select random opponent when character is created
  useEffect(() => {
    if (character && !opponent && !opponentSelected.current) {
      opponentSelected.current = true;
      const randomOpponent = getRandomOpponent();
      dispatch({ type: 'SET_OPPONENT', payload: randomOpponent });
    }
  }, [character, opponent, dispatch]);

  // Generate character image with deduplication
  useEffect(() => {
    if (character && !character.image_url && !imageGeneration.isGenerating && !imageGeneration.error) {
      const generateCharacterImage = async () => {
        try {
          const result = await imageGeneration.generateImage({
            prompt: character.image_prompt,
            cacheKey: `character-${character.character_name}-${character.image_prompt}`,
          });
          
          if (result?.url) {
            dispatch({ type: 'SET_CHARACTER_IMAGE', payload: result.url });
          }
        } catch (error) {
          // Don't log AbortError as it's expected when component unmounts
          if (error instanceof Error && error.name !== 'AbortError') {
            console.error('Failed to generate character image:', error);
          }
        }
      };

      generateCharacterImage();
    }
  }, [character, imageGeneration, dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      imageGeneration.cleanup();
    };
  }, [imageGeneration]);

  // If a power is selected, show the battle story screen
  if (selectedPower !== undefined) {
    return <BattleStoryScreen />;
  }

  if (!character || !opponent) return null;

  const handleAttackSelect = (powerIndex: number) => {
    dispatch({ type: 'SELECT_POWER', payload: powerIndex });
  };

  const handleRetryImageGeneration = () => {
    if (character) {
      imageGeneration.retry({
        prompt: character.image_prompt,
        cacheKey: `character-${character.character_name}-${character.image_prompt}`,
      }).then((result) => {
        if (result?.url) {
          dispatch({ type: 'SET_CHARACTER_IMAGE', payload: result.url });
        }
      }).catch((error) => {
        // Don't log AbortError as it's expected when component unmounts
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Failed to retry character image generation:', error);
        }
      });
    }
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
            isGeneratingImage={imageGeneration.isGenerating}
            imageGenerationError={imageGeneration.error}
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
          <CharacterCard character={opponent} />
        </div>
      </div>
    </div>
  );
}
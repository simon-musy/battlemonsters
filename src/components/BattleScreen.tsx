import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Sword, Shield, Zap, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export function BattleScreen() {
  const { state, dispatch } = useGame();
  const { character, isGeneratingImage, imageGenerationError } = state;

  useEffect(() => {
    if (character && !character.image_url && !isGeneratingImage && !imageGenerationError) {
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

          const { url } = await response.json();
          dispatch({ type: 'SET_CHARACTER_IMAGE', payload: url });
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

  if (!character) return null;

  const handleAttackSelect = (powerIndex: number) => {
    dispatch({ type: 'SELECT_POWER', payload: powerIndex });
  };

  const handleRetryImageGeneration = () => {
    dispatch({ type: 'SET_IMAGE_GENERATION_ERROR', payload: false });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Character Stats */}
        <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20">
          <div className="relative w-full aspect-square mb-6 rounded-lg overflow-hidden bg-gray-800/50">
            {isGeneratingImage ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-2" />
                <p className="text-sm text-purple-300">Generating image...</p>
              </div>
            ) : imageGenerationError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
                <p className="text-sm text-red-300 text-center mb-3">Failed to generate image</p>
                <button
                  onClick={handleRetryImageGeneration}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </button>
              </div>
            ) : character.image_url ? (
              <img
                src={character.image_url}
                alt={character.character_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center">
                  <Sword className="w-8 h-8 text-purple-400" />
                </div>
              </div>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">{character.character_name}</h2>
          <p className="text-purple-200 mb-6">{character.description}</p>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-red-900/30 border border-red-500/30">
                <Shield className="w-6 h-6 text-red-400" />
              </div>
              <div className="text-sm text-red-200">HP</div>
              <div className="font-bold text-red-400">{character.hp}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-yellow-900/30 border border-yellow-500/30">
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-sm text-yellow-200">Energy</div>
              <div className="font-bold text-yellow-400">{character.energy}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-blue-900/30 border border-blue-500/30">
                <Sword className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-sm text-blue-200">Mana</div>
              <div className="font-bold text-blue-400">{character.mana}</div>
            </div>
          </div>
        </div>

        {/* Powers List */}
        <div className="space-y-4">
          {character.powers.map((power, index) => (
            <button
              key={power.name}
              onClick={() => handleAttackSelect(index)}
              className="w-full p-4 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-purple-500/20 text-left transition-all hover:bg-purple-900/20 hover:border-purple-500/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-purple-200">{power.name}</h3>
                <div className="text-sm text-purple-300">
                  <span className="text-yellow-400">{power.energy_cost}</span> energy
                </div>
              </div>
              <p className="text-sm text-purple-300 mb-2">{power.description}</p>
              <div className="flex justify-between text-xs text-purple-400">
                <span>Damage: {power.damage_range}</span>
                <span>Cooldown: {power.cooldown}s</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
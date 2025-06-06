import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Sword, Shield, Zap, Loader2, AlertCircle, Skull } from 'lucide-react';
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
  image_url: "https://i.ibb.co/HLNJNcKg/Gemini-Generated-Image-6tj37f6tj37f6tj3.jpg"
};

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

  if (!character) return null;

  const handleAttackSelect = (powerIndex: number) => {
    dispatch({ type: 'SELECT_POWER', payload: powerIndex });
  };

  const renderCharacterCard = (char: any, isPlayer: boolean = false) => (
    <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20">
      <div className="relative w-full aspect-square mb-6 rounded-lg overflow-hidden bg-gray-800/50">
        {isPlayer && isGeneratingImage ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-2" />
            <p className="text-sm text-purple-300">Generating image...</p>
          </div>
        ) : isPlayer && imageGenerationError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
            <p className="text-sm text-red-300 text-center">Failed to generate image</p>
          </div>
        ) : char.image_url ? (
          <img
            src={char.image_url}
            alt={char.character_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center">
              {isPlayer ? <Sword className="w-8 h-8 text-purple-400" /> : <Skull className="w-8 h-8 text-red-400" />}
            </div>
          </div>
        )}
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-4">{char.character_name}</h2>
      <p className="text-purple-200 mb-6">{char.description}</p>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-red-900/30 border border-red-500/30">
            <Shield className="w-6 h-6 text-red-400" />
          </div>
          <div className="text-sm text-red-200">HP</div>
          <div className="font-bold text-red-400">{char.hp}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-yellow-900/30 border border-yellow-500/30">
            <Zap className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="text-sm text-yellow-200">Energy</div>
          <div className="font-bold text-yellow-400">{char.energy}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-blue-900/30 border border-blue-500/30">
            <Sword className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-sm text-blue-200">Mana</div>
          <div className="font-bold text-blue-400">{char.mana}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Battle Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Battle Arena</h1>
        <p className="text-purple-200">Choose your attack to begin the battle!</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Player Character */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-purple-200 text-center">Your Character</h3>
          {renderCharacterCard(character, true)}
        </div>

        {/* VS Divider & Powers */}
        <div className="space-y-6">
          {/* VS Section */}
          <div className="flex items-center justify-center">
            <div className="bg-gradient-to-r from-purple-600 to-red-600 text-white px-6 py-3 rounded-full font-bold text-xl shadow-lg">
              VS
            </div>
          </div>

          {/* Powers List */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-purple-200 text-center">Your Attacks</h3>
            {character.powers.map((power, index) => (
              <button
                key={power.name}
                onClick={() => handleAttackSelect(index)}
                className="w-full p-4 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-purple-500/20 text-left transition-all hover:bg-purple-900/20 hover:border-purple-500/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-semibold text-purple-200">{power.name}</h4>
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

        {/* Opponent Character */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-red-200 text-center">Opponent</h3>
          {renderCharacterCard(FIXED_OPPONENT)}
        </div>
      </div>
    </div>
  );
}
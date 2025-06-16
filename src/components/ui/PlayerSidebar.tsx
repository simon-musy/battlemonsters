import React from 'react';
import { ArrowLeft, Trophy, Skull } from 'lucide-react';
import type { Character, Power } from '../../types/game';

interface PlayerSidebarProps {
  character: Character;
  playerHp: number;
  battleEnded: boolean;
  playerWon: boolean;
  onGoBack: () => void;
  onAttack: (powerIndex: number) => void;
}

export function PlayerSidebar({ 
  character, 
  playerHp, 
  battleEnded, 
  playerWon, 
  onGoBack, 
  onAttack 
}: PlayerSidebarProps) {
  const playerHpPercentage = (playerHp / character.hp) * 100;

  return (
    <div className="w-80 bg-gray-900/80 backdrop-blur-sm border-r border-purple-500/20 p-6 flex flex-col">
      <button
        onClick={onGoBack}
        className="flex items-center gap-2 text-purple-300 hover:text-purple-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Battle Setup
      </button>

      <div className="text-center mb-6">
        <div className="text-lg font-semibold text-purple-200 mb-2">{character.character_name}</div>
        
        {/* Player HP Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-purple-300 mb-1">
            <span>HP</span>
            <span>{playerHp}/{character.hp}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                playerHp <= 0 ? 'bg-gradient-to-r from-gray-500 to-gray-400' : 'bg-gradient-to-r from-red-500 to-red-400'
              }`}
              style={{ width: `${playerHpPercentage}%` }}
            />
          </div>
        </div>

        {/* Character Image */}
        <div className="w-32 h-32 mx-auto mb-4 rounded-lg overflow-hidden bg-gray-800/50">
          {character.image_url ? (
            <img
              src={character.image_url}
              alt={character.character_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center">
                <span className="text-2xl">⚔️</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Battle Status */}
      {battleEnded && (
        <div className={`mb-6 p-4 rounded-lg text-center ${
          playerWon ? 'bg-green-900/50 border border-green-500/50' : 'bg-red-900/50 border border-red-500/50'
        }`}>
          <div className="flex items-center justify-center mb-2">
            {playerWon ? (
              <Trophy className="w-8 h-8 text-yellow-400" />
            ) : (
              <Skull className="w-8 h-8 text-red-400" />
            )}
          </div>
          <h3 className={`text-xl font-bold ${playerWon ? 'text-green-200' : 'text-red-200'}`}>
            {playerWon ? 'VICTORY!' : 'DEFEAT!'}
          </h3>
          <p className={`text-sm ${playerWon ? 'text-green-300' : 'text-red-300'}`}>
            {playerWon ? 'You have triumphed!' : 'You have been defeated!'}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex-1">
        <div className="space-y-3">
          {character.powers.map((power, index) => (
            <button
              key={power.name}
              onClick={() => onAttack(index)}
              disabled={battleEnded}
              className={`w-full p-3 border rounded-lg text-left transition-all duration-200 ${
                battleEnded 
                  ? 'bg-gray-800/30 border-gray-600/20 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-800/50 hover:bg-purple-900/30 border-purple-500/20 hover:border-purple-500/40'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className={`font-semibold text-sm ${battleEnded ? 'text-gray-500' : 'text-purple-200'}`}>
                  {power.name}
                </h4>
                <span className={`text-xs ${battleEnded ? 'text-gray-600' : 'text-yellow-400'}`}>
                  {power.energy_cost}
                </span>
              </div>
              <p className={`text-xs mb-1 ${battleEnded ? 'text-gray-600' : 'text-purple-300'}`}>
                {power.description}
              </p>
              <div className={`text-xs ${battleEnded ? 'text-gray-600' : 'text-purple-400'}`}>
                Damage: {power.damage_range}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Skull } from 'lucide-react';
import type { Opponent } from '../../types/game';

interface OpponentHealthBarProps {
  opponent: Opponent;
  currentHp: number;
}

export function OpponentHealthBar({ opponent, currentHp }: OpponentHealthBarProps) {
  const opponentHpPercentage = (currentHp / opponent.hp) * 100;

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border-b border-purple-500/20 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          {/* Enemy Badge */}
          <div className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded border border-red-400">
            ENEMY
          </div>
          
          {/* HP Bar - Takes most of the space */}
          <div className="flex-1">
            <div className="flex justify-between text-sm text-red-100 mb-1">
              <span className="font-semibold">HP</span>
              <span className="font-bold">{currentHp}/{opponent.hp}</span>
            </div>
            <div className="relative">
              {/* HP Bar Background */}
              <div className="w-full bg-gray-800/80 rounded-full h-4 border border-gray-600/50">
                {/* HP Bar Fill */}
                <div 
                  className={`h-full rounded-full transition-all duration-500 relative overflow-hidden ${
                    currentHp <= 0 
                      ? 'bg-gradient-to-r from-gray-600 to-gray-500' 
                      : 'bg-gradient-to-r from-red-500 via-red-400 to-red-300'
                  }`}
                  style={{ width: `${opponentHpPercentage}%` }}
                >
                  {/* Animated shine effect */}
                  {currentHp > 0 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  )}
                </div>
              </div>
              {/* HP Bar Border Highlight */}
              <div className="absolute inset-0 rounded-full border border-red-400/40 pointer-events-none"></div>
            </div>
          </div>
          
          {/* Character Name */}
          <div className="text-xl font-bold text-white drop-shadow-lg">
            {opponent.character_name}
          </div>
          
          {/* Character Portrait */}
          <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-yellow-400/60 bg-gray-800/50">
            {opponent.image_url ? (
              <img
                src={opponent.image_url}
                alt={opponent.character_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Skull className="w-6 h-6 text-red-400" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
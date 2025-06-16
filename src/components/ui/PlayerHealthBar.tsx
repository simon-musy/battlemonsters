import React from 'react';
import type { Character } from '../../types/game';

interface PlayerHealthBarProps {
  character: Character;
  currentHp: number;
}

export function PlayerHealthBar({ character, currentHp }: PlayerHealthBarProps) {
  const playerHpPercentage = (currentHp / character.hp) * 100;

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm text-purple-300 mb-1">
        <span>HP</span>
        <span>{currentHp}/{character.hp}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3">
        <div 
          className={`h-3 rounded-full transition-all duration-500 ${
            currentHp <= 0 ? 'bg-gradient-to-r from-gray-500 to-gray-400' : 'bg-gradient-to-r from-red-500 to-red-400'
          }`}
          style={{ width: `${playerHpPercentage}%` }}
        />
      </div>
    </div>
  );
}
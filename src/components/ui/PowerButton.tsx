import React from 'react';
import type { Power } from '../../types/game';

interface PowerButtonProps {
  power: Power;
  index: number;
  disabled: boolean;
  onClick: (index: number) => void;
}

export function PowerButton({ power, index, disabled, onClick }: PowerButtonProps) {
  return (
    <button
      onClick={() => onClick(index)}
      disabled={disabled}
      className={`w-full p-3 border rounded-lg text-left transition-all duration-200 ${
        disabled 
          ? 'bg-gray-800/30 border-gray-600/20 text-gray-500 cursor-not-allowed' 
          : 'bg-gray-800/50 hover:bg-purple-900/30 border-purple-500/20 hover:border-purple-500/40'
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <h4 className={`font-semibold text-sm ${disabled ? 'text-gray-500' : 'text-purple-200'}`}>
          {power.name}
        </h4>
        <span className={`text-xs ${disabled ? 'text-gray-600' : 'text-yellow-400'}`}>
          {power.energy_cost}
        </span>
      </div>
      <p className={`text-xs mb-1 ${disabled ? 'text-gray-600' : 'text-purple-300'}`}>
        {power.description}
      </p>
      <div className={`text-xs ${disabled ? 'text-gray-600' : 'text-purple-400'}`}>
        Damage: {power.damage_range}
      </div>
    </button>
  );
}
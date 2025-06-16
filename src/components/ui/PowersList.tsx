import React from 'react';
import type { Power } from '../../types/game';

interface PowersListProps {
  powers: Power[];
  onPowerSelect: (powerIndex: number) => void;
  disabled?: boolean;
}

export function PowersList({ powers, onPowerSelect, disabled = false }: PowersListProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-purple-200 text-center">Your Attacks</h3>
      {powers.map((power, index) => (
        <button
          key={power.name}
          onClick={() => onPowerSelect(index)}
          disabled={disabled}
          className={`w-full p-4 rounded-xl border text-left transition-all ${
            disabled
              ? 'bg-gray-900/30 border-gray-600/20 text-gray-500 cursor-not-allowed'
              : 'bg-gray-900/50 backdrop-blur-sm border-purple-500/20 hover:bg-purple-900/20 hover:border-purple-500/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className={`text-lg font-semibold ${disabled ? 'text-gray-500' : 'text-purple-200'}`}>
              {power.name}
            </h4>
            <div className={`text-sm ${disabled ? 'text-gray-600' : 'text-purple-300'}`}>
              <span className={disabled ? 'text-gray-600' : 'text-yellow-400'}>{power.energy_cost}</span> energy
            </div>
          </div>
          <p className={`text-sm mb-2 ${disabled ? 'text-gray-600' : 'text-purple-300'}`}>
            {power.description}
          </p>
          <div className={`flex justify-between text-xs ${disabled ? 'text-gray-600' : 'text-purple-400'}`}>
            <span>Damage: {power.damage_range}</span>
            <span>Cooldown: {power.cooldown}s</span>
          </div>
        </button>
      ))}
    </div>
  );
}
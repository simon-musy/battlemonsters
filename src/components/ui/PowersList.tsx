import React from 'react';
import { PowerButton } from './PowerButton';
import type { Power } from '../../types/game';

interface PowersListProps {
  powers: Power[];
  onPowerSelect: (powerIndex: number) => void;
  disabled?: boolean;
}

export function PowersList({ powers, onPowerSelect, disabled = false }: PowersListProps) {
  return (
    <div className="flex-1">
      <div className="space-y-3">
        {powers.map((power, index) => (
          <PowerButton
            key={power.name}
            power={power}
            index={index}
            disabled={disabled}
            onClick={onPowerSelect}
          />
        ))}
      </div>
    </div>
  );
}
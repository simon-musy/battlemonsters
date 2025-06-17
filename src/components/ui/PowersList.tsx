import React from 'react';
import { BattleActionButton } from './BattleActionButton';
import { CustomActionInput } from './CustomActionInput';
import { Loader2 } from 'lucide-react';
import type { Power, BattleAction } from '../../types/game';

interface PowersListProps {
  powers?: Power[];
  battleActions?: BattleAction[];
  onPowerSelect: (powerIndex: number) => void;
  onCustomAction?: (actionDescription: string) => void;
  disabled?: boolean;
  isGeneratingActions?: boolean;
}

export function PowersList({ 
  powers, 
  battleActions, 
  onPowerSelect, 
  onCustomAction,
  disabled = false,
  isGeneratingActions = false 
}: PowersListProps) {
  // If we have battle actions, use those instead of powers
  if (battleActions) {
    return (
      <div className="flex-1">
        {isGeneratingActions ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-4" />
            <p className="text-purple-300 text-center">Generating new battle actions...</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {battleActions.map((action, index) => (
                <BattleActionButton
                  key={`${action.name}-${index}`}
                  action={action}
                  index={index}
                  disabled={disabled}
                  onClick={onPowerSelect}
                />
              ))}
            </div>
            
            {/* Custom Action Input */}
            {onCustomAction && (
              <CustomActionInput
                onExecuteCustomAction={onCustomAction}
                disabled={disabled}
              />
            )}
          </>
        )}
      </div>
    );
  }

  // Fallback to powers if no battle actions
  if (!powers) return null;

  return (
    <div className="flex-1">
      <div className="space-y-3">
        {powers.map((power, index) => (
          <button
            key={power.name}
            onClick={() => onPowerSelect(index)}
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
        ))}
      </div>
      
      {/* Custom Action Input for powers fallback */}
      {onCustomAction && (
        <CustomActionInput
          onExecuteCustomAction={onCustomAction}
          disabled={disabled}
        />
      )}
    </div>
  );
}
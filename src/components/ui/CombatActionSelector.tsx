import React from 'react';
import { Sword, Shield, Sparkles, RotateCcw, Loader2 } from 'lucide-react';
import type { CombatState, CombatAction } from '../../types/combat';

interface CombatActionSelectorProps {
  combatState: CombatState;
  onActionSelect: (action: CombatAction) => void;
  disabled: boolean;
}

export function CombatActionSelector({ combatState, onActionSelect, disabled }: CombatActionSelectorProps) {
  const getActionIcon = (type: string) => {
    switch (type) {
      case 'attack':
        return <Sword className="w-5 h-5" />;
      case 'defend':
        return <Shield className="w-5 h-5" />;
      case 'special':
        return <Sparkles className="w-5 h-5" />;
      case 'counter':
        return <RotateCcw className="w-5 h-5" />;
      default:
        return <Sword className="w-5 h-5" />;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'attack':
        return 'border-red-500/30 hover:border-red-500/50 bg-red-900/20 hover:bg-red-900/30 text-red-200';
      case 'defend':
        return 'border-blue-500/30 hover:border-blue-500/50 bg-blue-900/20 hover:bg-blue-900/30 text-blue-200';
      case 'special':
        return 'border-purple-500/30 hover:border-purple-500/50 bg-purple-900/20 hover:bg-purple-900/30 text-purple-200';
      case 'counter':
        return 'border-yellow-500/30 hover:border-yellow-500/50 bg-yellow-900/20 hover:bg-yellow-900/30 text-yellow-200';
      default:
        return 'border-gray-500/30 hover:border-gray-500/50 bg-gray-900/20 hover:bg-gray-900/30 text-gray-200';
    }
  };

  const canAffordAction = (action: CombatAction) => {
    return combatState.player_energy >= action.energy_cost;
  };

  if (combatState.current_phase.status === 'declaring' && combatState.current_phase.phase === 'opponent_initiative') {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Opponent's Turn</h3>
          <p className="text-purple-200">Your opponent is choosing their action...</p>
        </div>
      </div>
    );
  }

  if (combatState.current_phase.status === 'resolving' || combatState.current_phase.status === 'completed') {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Resolving Actions</h3>
          <p className="text-purple-200">Combat actions are being resolved...</p>
        </div>
      </div>
    );
  }

  const isReactionPhase = combatState.waiting_for_reaction && combatState.current_phase.phase === 'opponent_initiative';
  const title = combatState.current_phase.phase === 'player_initiative' 
    ? 'Choose Your Action' 
    : 'Choose Your Reaction';
  const subtitle = combatState.current_phase.phase === 'player_initiative'
    ? 'You have the initiative - your opponent will react to your choice'
    : `React to opponent's ${combatState.opponent_declared_action?.name || 'action'}`;

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-purple-200">{subtitle}</p>
        {isReactionPhase && combatState.opponent_declared_action && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
            <p className="text-red-200 text-sm">
              <strong>Opponent's Action:</strong> {combatState.opponent_declared_action.name}
            </p>
            <p className="text-red-300 text-xs mt-1">
              {combatState.opponent_declared_action.description}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {combatState.available_actions.map((action) => {
          const canAfford = canAffordAction(action);
          const isDisabled = disabled || !canAfford;

          return (
            <button
              key={action.id}
              onClick={() => onActionSelect(action)}
              disabled={isDisabled}
              className={`p-4 border rounded-lg text-left transition-all duration-200 ${
                isDisabled 
                  ? 'border-gray-600/20 bg-gray-800/30 text-gray-500 cursor-not-allowed' 
                  : getActionColor(action.type)
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getActionIcon(action.type)}
                  <h4 className="font-semibold text-sm">{action.name}</h4>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-bold ${!canAfford ? 'text-red-400' : 'text-green-400'}`}>
                    {action.energy_cost} Energy
                  </div>
                  <div className="text-xs text-orange-400">
                    {action.damage} DMG
                  </div>
                </div>
              </div>
              
              <p className="text-xs mb-2 opacity-90">
                {action.description}
              </p>
              
              <div className="flex flex-wrap gap-1">
                <span className="text-xs px-2 py-1 bg-green-900/50 text-green-300 rounded">
                  Strong vs: {action.strengths.join(', ')}
                </span>
                <span className="text-xs px-2 py-1 bg-red-900/50 text-red-300 rounded">
                  Weak vs: {action.weaknesses.join(', ')}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 text-center text-xs text-purple-300">
        Turn {combatState.current_phase.turn_number} • {combatState.current_phase.phase === 'player_initiative' ? 'Player Initiative' : 'Opponent Initiative'}
      </div>
    </div>
  );
}
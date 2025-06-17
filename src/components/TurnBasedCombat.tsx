import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { CombatActionSelector } from './ui/CombatActionSelector';
import { CombatPhaseDisplay } from './ui/CombatPhaseDisplay';
import { CombatLog } from './ui/CombatLog';
import { CombatStats } from './ui/CombatStats';
import { VictoryScreen } from './ui/VictoryScreen';
import { 
  initializeCombatState, 
  resolveCombatActions, 
  selectOpponentReaction, 
  selectOpponentInitiative,
  advanceCombatPhase,
  checkVictoryCondition
} from '../utils/combatSystem';
import type { CombatState, CombatAction } from '../types/combat';

export function TurnBasedCombat() {
  const { state } = useGame();
  const { character, opponent } = state;

  const [combatState, setCombatState] = useState<CombatState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize combat when component mounts
  useEffect(() => {
    if (character && opponent && !combatState) {
      console.log('Initializing combat state...');
      console.log('Character:', character);
      console.log('Opponent:', opponent);
      
      const initialState = initializeCombatState(
        character.hp,
        opponent.hp,
        character.energy,
        opponent.energy
      );
      
      console.log('Initial combat state:', initialState);
      setCombatState(initialState);
    }
  }, [character, opponent, combatState]);

  // Debug logging
  useEffect(() => {
    console.log('TurnBasedCombat render state:', {
      character: !!character,
      opponent: !!opponent,
      combatState: !!combatState,
      characterName: character?.character_name,
      opponentName: opponent?.character_name
    });
  }, [character, opponent, combatState]);

  if (!character || !opponent) {
    console.log('Missing character or opponent:', { character: !!character, opponent: !!opponent });
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading characters...</div>
      </div>
    );
  }

  if (!combatState) {
    console.log('Combat state not initialized yet');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Initializing Combat...</div>
      </div>
    );
  }

  if (combatState.is_battle_ended) {
    return (
      <VictoryScreen
        winner={combatState.winner!}
        character={character}
        opponent={opponent}
        combatLog={combatState.combat_log}
      />
    );
  }

  const handlePlayerAction = async (action: CombatAction) => {
    if (isProcessing || !combatState) return;

    setIsProcessing(true);

    try {
      let newState = { ...combatState };

      if (newState.current_phase.phase === 'player_initiative') {
        // Player declares action, opponent reacts
        newState.declared_action = action;
        newState.current_phase.initiator_action = action;
        newState.current_phase.status = 'reacting';
        newState.waiting_for_reaction = true;

        // AI selects reaction
        await new Promise(resolve => setTimeout(resolve, 1000)); // Dramatic pause
        const opponentReaction = selectOpponentReaction(action, newState.opponent_available_actions);
        
        newState.opponent_declared_action = opponentReaction;
        newState.current_phase.reactor_action = opponentReaction;
        newState.current_phase.status = 'resolving';

        // Resolve actions
        const resolution = resolveCombatActions(
          action,
          opponentReaction,
          newState.player_hp,
          newState.opponent_hp,
          newState.player_energy,
          newState.opponent_energy
        );

        newState.current_phase.resolution = resolution;
        newState.player_hp = Math.max(0, newState.player_hp - resolution.initiator_damage_taken);
        newState.opponent_hp = Math.max(0, newState.opponent_hp - resolution.reactor_damage_taken);
        newState.player_energy = Math.max(0, newState.player_energy - action.energy_cost);
        newState.opponent_energy = Math.max(0, newState.opponent_energy - opponentReaction.energy_cost);

        // Apply healing effects
        if (action.effects?.self_heal) {
          newState.player_hp = Math.min(newState.player_max_hp, newState.player_hp + action.effects.self_heal);
        }
        if (opponentReaction.effects?.self_heal) {
          newState.opponent_hp = Math.min(newState.opponent_max_hp, newState.opponent_hp + opponentReaction.effects.self_heal);
        }

        newState.current_phase.status = 'completed';
        newState.combat_log.push({ ...newState.current_phase });

        // Check for victory
        newState = checkVictoryCondition(newState);

        if (!newState.is_battle_ended) {
          // Advance to opponent initiative phase
          await new Promise(resolve => setTimeout(resolve, 2000)); // Show resolution
          newState = advanceCombatPhase(newState);
        }

      } else {
        // Opponent initiative phase - player reacts to opponent's declared action
        if (!newState.opponent_declared_action) {
          throw new Error('No opponent action declared');
        }

        newState.current_phase.reactor_action = action;
        newState.current_phase.status = 'resolving';

        // Resolve actions (opponent is initiator)
        const resolution = resolveCombatActions(
          newState.opponent_declared_action,
          action,
          newState.opponent_hp,
          newState.player_hp,
          newState.opponent_energy,
          newState.player_energy
        );

        newState.current_phase.resolution = resolution;
        newState.opponent_hp = Math.max(0, newState.opponent_hp - resolution.initiator_damage_taken);
        newState.player_hp = Math.max(0, newState.player_hp - resolution.reactor_damage_taken);
        newState.opponent_energy = Math.max(0, newState.opponent_energy - newState.opponent_declared_action.energy_cost);
        newState.player_energy = Math.max(0, newState.player_energy - action.energy_cost);

        // Apply healing effects
        if (newState.opponent_declared_action.effects?.self_heal) {
          newState.opponent_hp = Math.min(newState.opponent_max_hp, newState.opponent_hp + newState.opponent_declared_action.effects.self_heal);
        }
        if (action.effects?.self_heal) {
          newState.player_hp = Math.min(newState.player_max_hp, newState.player_hp + action.effects.self_heal);
        }

        newState.current_phase.status = 'completed';
        newState.combat_log.push({ ...newState.current_phase });

        // Check for victory
        newState = checkVictoryCondition(newState);

        if (!newState.is_battle_ended) {
          // Advance to next player initiative phase
          await new Promise(resolve => setTimeout(resolve, 2000)); // Show resolution
          newState = advanceCombatPhase(newState);
        }
      }

      setCombatState(newState);

    } catch (error) {
      console.error('Error processing combat action:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpponentInitiative = async () => {
    if (isProcessing || !combatState || combatState.current_phase.phase !== 'opponent_initiative') return;

    setIsProcessing(true);

    try {
      let newState = { ...combatState };

      // Opponent declares action
      const opponentAction = selectOpponentInitiative(newState.opponent_available_actions);
      newState.opponent_declared_action = opponentAction;
      newState.current_phase.initiator_action = opponentAction;
      newState.current_phase.status = 'reacting';
      newState.waiting_for_reaction = true;

      setCombatState(newState);
    } catch (error) {
      console.error('Error processing opponent initiative:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-trigger opponent initiative
  useEffect(() => {
    if (combatState?.current_phase.phase === 'opponent_initiative' && 
        combatState.current_phase.status === 'declaring' && 
        !isProcessing) {
      const timer = setTimeout(() => {
        handleOpponentInitiative();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [combatState?.current_phase, isProcessing]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Combat Stats */}
          <div className="space-y-6">
            <CombatStats
              character={character}
              opponent={opponent}
              combatState={combatState}
            />
          </div>

          {/* Center Column - Main Combat Area */}
          <div className="space-y-6">
            <CombatPhaseDisplay
              combatState={combatState}
              character={character}
              opponent={opponent}
              isProcessing={isProcessing}
            />

            <CombatActionSelector
              combatState={combatState}
              onActionSelect={handlePlayerAction}
              disabled={isProcessing || combatState.is_battle_ended}
            />
          </div>

          {/* Right Column - Combat Log */}
          <div>
            <CombatLog combatLog={combatState.combat_log} />
          </div>
        </div>
      </div>
    </div>
  );
}
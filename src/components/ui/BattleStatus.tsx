import React from 'react';
import { Trophy, Skull } from 'lucide-react';

interface BattleStatusProps {
  battleEnded: boolean;
  playerWon: boolean;
}

export function BattleStatus({ battleEnded, playerWon }: BattleStatusProps) {
  if (!battleEnded) return null;

  return (
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
  );
}
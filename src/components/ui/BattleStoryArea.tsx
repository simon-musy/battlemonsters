import React from 'react';
import { BattlePanel } from './BattlePanel';

interface BattlePanelData {
  id: string;
  imageUrl?: string;
  isGenerating: boolean;
  error: boolean;
  prompt: string;
  aspectRatio?: string;
  isFinalPanel?: boolean;
}

interface BattleStoryAreaProps {
  battlePanels: BattlePanelData[];
  playerWon: boolean;
  onRetryPanel: (index: number) => void;
}

export function BattleStoryArea({ battlePanels, playerWon, onRetryPanel }: BattleStoryAreaProps) {
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {battlePanels.length === 0 ? (
          <div className="text-center text-purple-300 py-12">
            <p className="text-lg">Select an attack to begin the epic battle story!</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 justify-center">
            {battlePanels.map((panel, index) => (
              <BattlePanel
                key={panel.id}
                panel={panel}
                index={index}
                playerWon={playerWon}
                onRetry={onRetryPanel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
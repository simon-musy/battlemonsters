import React from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface BattlePanelData {
  id: string;
  imageUrl?: string;
  isGenerating: boolean;
  error: boolean;
  prompt: string;
  aspectRatio?: string;
  isFinalPanel?: boolean;
}

interface BattlePanelProps {
  panel: BattlePanelData;
  index: number;
  playerWon?: boolean;
  onRetry: (index: number) => void;
}

export function BattlePanel({ panel, index, playerWon, onRetry }: BattlePanelProps) {
  // Calculate width based on aspect ratio to maintain consistent height
  const calculateWidth = (aspectRatio: string) => {
    if (!aspectRatio) return 'w-80'; // Default width
    
    const [width, height] = aspectRatio.split(':').map(Number);
    const ratio = width / height;
    
    // Base height is 320px (h-80), calculate width accordingly
    const calculatedWidth = Math.round(320 * ratio);
    
    // Convert to Tailwind classes or use custom width
    if (calculatedWidth <= 256) return 'w-64';
    if (calculatedWidth <= 320) return 'w-80';
    if (calculatedWidth <= 384) return 'w-96';
    if (calculatedWidth <= 448) return 'w-112';
    if (calculatedWidth <= 512) return 'w-128';
    
    // For very wide images, use custom width
    return `w-[${calculatedWidth}px]`;
  };

  return (
    <div
      className={`h-80 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-purple-500/20 overflow-hidden flex-shrink-0 relative ${
        panel.aspectRatio ? calculateWidth(panel.aspectRatio) : 'w-80'
      }`}
    >
      {panel.isGenerating ? (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
          <p className="text-purple-300 text-center px-4">
            {panel.isFinalPanel ? 'Generating final scene...' : 'Generating epic battle scene...'}
          </p>
        </div>
      ) : panel.error ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-6">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-red-300 text-center mb-4">
            Failed to generate battle scene
          </p>
          <button
            onClick={() => onRetry(index)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      ) : panel.imageUrl ? (
        <>
          <img
            src={panel.imageUrl}
            alt={`Epic battle scene ${index + 1}`}
            className="w-full h-full object-cover"
          />
          {/* Victory/Defeat Overlay for Final Panel */}
          {panel.isFinalPanel && (
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-6xl font-black text-white uppercase tracking-wider drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                {playerWon ? 'YOU WON!' : 'YOU LOST!'}
              </h2>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
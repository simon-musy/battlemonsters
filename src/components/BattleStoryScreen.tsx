import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Loader2, AlertCircle, RefreshCw, ArrowLeft, Trophy, Skull } from 'lucide-react';
import type { Opponent } from '../types/game';

// Fixed opponent for now
const FIXED_OPPONENT: Opponent = {
  character_name: "Shadow Reaper",
  description: "A dark entity from the void realm, wielding ancient necromantic powers and feeding on the life force of its enemies.",
  hp: 120,
  energy: 100,
  mana: 85,
  powers: [
    {
      name: "Soul Drain",
      description: "Drains life force from the enemy while restoring own HP",
      energy_cost: 25,
      cooldown: 4,
      damage_range: "20-35"
    },
    {
      name: "Shadow Strike",
      description: "A swift attack from the shadows that ignores armor",
      energy_cost: 20,
      cooldown: 3,
      damage_range: "15-30"
    },
    {
      name: "Void Blast",
      description: "Unleashes a devastating blast of dark energy",
      energy_cost: 40,
      cooldown: 6,
      damage_range: "35-50"
    }
  ],
  image_url: "https://i.ibb.co/HLNJNcKg/Gemini-Generated-Image-6tj37f6tj37f6tj3.jpg"
};

interface BattlePanel {
  id: string;
  imageUrl?: string;
  isGenerating: boolean;
  error: boolean;
  prompt: string;
  aspectRatio?: string;
  isFinalPanel?: boolean;
}

export function BattleStoryScreen() {
  const { state, dispatch } = useGame();
  const { character } = state;
  
  const [playerHp, setPlayerHp] = useState(character?.hp || 100);
  const [opponentHp, setOpponentHp] = useState(FIXED_OPPONENT.hp);
  const [battlePanels, setBattlePanels] = useState<BattlePanel[]>([]);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [battleEnded, setBattleEnded] = useState(false);
  const [playerWon, setPlayerWon] = useState(false);

  useEffect(() => {
    // Generate the first battle panel when component mounts
    if (state.selectedPower !== undefined && character) {
      generateBattlePanel(0);
    }
  }, []);

  // Check for battle end conditions
  useEffect(() => {
    if (playerHp <= 0 && !battleEnded) {
      setBattleEnded(true);
      setPlayerWon(false);
      generateFinalPanel(false);
    } else if (opponentHp <= 0 && !battleEnded) {
      setBattleEnded(true);
      setPlayerWon(true);
      generateFinalPanel(true);
    }
  }, [playerHp, opponentHp, battleEnded]);

  const generateFinalPanel = async (victory: boolean) => {
    if (!character) return;

    const prompt = victory 
      ? `Epic fantasy victory scene: ${character.character_name} standing triumphantly over the defeated ${FIXED_OPPONENT.character_name}. Glorious victory pose, golden light rays, magical energy swirling around the victor, debris and smoke from the intense battle, dramatic lighting, cinematic composition, heroic stance, celebration of triumph, epic fantasy art style, high contrast, victory celebration, champion pose.`
      : `Dark fantasy defeat scene: ${FIXED_OPPONENT.character_name} standing victorious over the fallen ${character.character_name}. Ominous shadows, dark energy emanating from the victor, dramatic defeat composition, somber lighting, fallen hero, epic battle aftermath, dark fantasy art style, high contrast, defeat and loss, tragic scene.`;

    const finalPanelIndex = battlePanels.length;
    
    setBattlePanels(prev => [
      ...prev,
      {
        id: `final-panel`,
        isGenerating: true,
        error: false,
        prompt,
        aspectRatio: '16:9', // Force 16:9 for final panel
        isFinalPanel: true
      }
    ]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/character-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            prompt,
            aspect_ratio: '16:9' // Force 16:9 aspect ratio for final image
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate final battle image');
      }

      const data = await response.json();
      
      setBattlePanels(prev => {
        const newPanels = [...prev];
        newPanels[finalPanelIndex] = {
          ...newPanels[finalPanelIndex],
          imageUrl: data.url,
          aspectRatio: '16:9', // Ensure 16:9 aspect ratio
          isGenerating: false,
          error: false
        };
        return newPanels;
      });

    } catch (error) {
      console.error('Failed to generate final battle image:', error);
      setBattlePanels(prev => {
        const newPanels = [...prev];
        newPanels[finalPanelIndex] = {
          ...newPanels[finalPanelIndex],
          isGenerating: false,
          error: true
        };
        return newPanels;
      });
    }
  };

  const generateBattlePanel = async (panelIndex: number) => {
    if (!character) return;

    const selectedPower = character.powers[state.selectedPower || 0];
    
    // Create intense, action-packed battle prompts
    const prompt = `Epic fantasy battle scene: ${character.character_name} unleashing devastating ${selectedPower.name} attack against ${FIXED_OPPONENT.character_name}. ${selectedPower.description}. Intense combat action, explosive magical effects, dramatic lighting, debris flying, energy blasts, fierce expressions, dynamic poses, cinematic battle photography, high contrast, sparks and flames, destruction and chaos, epic confrontation, dark fantasy art style.`;

    // Add new panel or update existing one
    setBattlePanels(prev => {
      const newPanels = [...prev];
      if (newPanels[panelIndex]) {
        newPanels[panelIndex] = { ...newPanels[panelIndex], isGenerating: true, error: false };
      } else {
        newPanels.push({
          id: `panel-${panelIndex}`,
          isGenerating: true,
          error: false,
          prompt
        });
      }
      return newPanels;
    });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/character-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate battle image');
      }

      const data = await response.json();
      
      setBattlePanels(prev => {
        const newPanels = [...prev];
        newPanels[panelIndex] = {
          ...newPanels[panelIndex],
          imageUrl: data.url,
          aspectRatio: data.aspect_ratio,
          isGenerating: false,
          error: false
        };
        return newPanels;
      });

      // Simulate battle damage
      const playerDamage = Math.floor(Math.random() * 25) + 10; // Player takes 10-35 damage
      const opponentDamage = Math.floor(Math.random() * 30) + 15; // Opponent takes 15-45 damage
      
      setOpponentHp(prev => Math.max(0, prev - opponentDamage));
      setPlayerHp(prev => Math.max(0, prev - playerDamage));

    } catch (error) {
      console.error('Failed to generate battle image:', error);
      setBattlePanels(prev => {
        const newPanels = [...prev];
        newPanels[panelIndex] = {
          ...newPanels[panelIndex],
          isGenerating: false,
          error: true
        };
        return newPanels;
      });
    }
  };

  const handleAttack = async (powerIndex: number) => {
    if (!character || battleEnded) return;
    
    dispatch({ type: 'SELECT_POWER', payload: powerIndex });
    const nextPanelIndex = battlePanels.length;
    await generateBattlePanel(nextPanelIndex);
  };

  const retryPanel = (panelIndex: number) => {
    if (battlePanels[panelIndex].isFinalPanel) {
      generateFinalPanel(playerWon);
    } else {
      generateBattlePanel(panelIndex);
    }
  };

  const goBackToBattle = () => {
    dispatch({ type: 'SELECT_POWER', payload: undefined });
  };

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

  if (!character) return null;

  const playerHpPercentage = (playerHp / character.hp) * 100;
  const opponentHpPercentage = (opponentHp / FIXED_OPPONENT.hp) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex">
      {/* Left Sidebar - Player Info */}
      <div className="w-80 bg-gray-900/80 backdrop-blur-sm border-r border-purple-500/20 p-6 flex flex-col">
        <button
          onClick={goBackToBattle}
          className="flex items-center gap-2 text-purple-300 hover:text-purple-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Battle Setup
        </button>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white mb-2">ME</h2>
          <div className="text-lg font-semibold text-purple-200 mb-2">{character.character_name}</div>
          
          {/* Player HP Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-purple-300 mb-1">
              <span>HP</span>
              <span>{playerHp}/{character.hp}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  playerHp <= 0 ? 'bg-gradient-to-r from-gray-500 to-gray-400' : 'bg-gradient-to-r from-red-500 to-red-400'
                }`}
                style={{ width: `${playerHpPercentage}%` }}
              />
            </div>
          </div>

          {/* Character Image */}
          <div className="w-32 h-32 mx-auto mb-4 rounded-lg overflow-hidden bg-gray-800/50">
            {character.image_url ? (
              <img
                src={character.image_url}
                alt={character.character_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center">
                  <span className="text-2xl">⚔️</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Battle Status */}
        {battleEnded && (
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
        )}

        {/* Actions */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-purple-200 mb-4">ACTIONS</h3>
          <div className="space-y-3">
            {character.powers.map((power, index) => (
              <button
                key={power.name}
                onClick={() => handleAttack(index)}
                disabled={battleEnded}
                className={`w-full p-3 border rounded-lg text-left transition-all duration-200 ${
                  battleEnded 
                    ? 'bg-gray-800/30 border-gray-600/20 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-800/50 hover:bg-purple-900/30 border-purple-500/20 hover:border-purple-500/40'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`font-semibold text-sm ${battleEnded ? 'text-gray-500' : 'text-purple-200'}`}>
                    {power.name}
                  </h4>
                  <span className={`text-xs ${battleEnded ? 'text-gray-600' : 'text-yellow-400'}`}>
                    {power.energy_cost}
                  </span>
                </div>
                <p className={`text-xs mb-1 ${battleEnded ? 'text-gray-600' : 'text-purple-300'}`}>
                  {power.description}
                </p>
                <div className={`text-xs ${battleEnded ? 'text-gray-600' : 'text-purple-400'}`}>
                  Damage: {power.damage_range}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar - Opponent Info */}
        <div className="bg-gray-900/80 backdrop-blur-sm border-b border-purple-500/20 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-white mb-2">OPPONENT</h2>
              <div className="text-xl font-semibold text-red-200">{FIXED_OPPONENT.character_name}</div>
            </div>
            
            {/* Opponent HP Bar */}
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-sm text-red-300 mb-2">
                <span>HP</span>
                <span>{opponentHp}/{FIXED_OPPONENT.hp}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-500 ${
                    opponentHp <= 0 ? 'bg-gradient-to-r from-gray-500 to-gray-400' : 'bg-gradient-to-r from-red-600 to-red-500'
                  }`}
                  style={{ width: `${opponentHpPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Story Space - Comic Strip */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl font-bold text-white text-center mb-8">BATTLE STORY</h3>
            
            {battlePanels.length === 0 ? (
              <div className="text-center text-purple-300 py-12">
                <p className="text-lg">Select an attack to begin the epic battle story!</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4 justify-center">
                {battlePanels.map((panel, index) => (
                  <div
                    key={panel.id}
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
                          onClick={() => retryPanel(index)}
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
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
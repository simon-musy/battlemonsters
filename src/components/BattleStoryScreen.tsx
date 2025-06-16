import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { PlayerSidebar } from './ui/PlayerSidebar';
import { OpponentHealthBar } from './ui/OpponentHealthBar';
import { BattleStoryArea } from './ui/BattleStoryArea';
import { useImageGeneration } from '../hooks/useImageGeneration';

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
  const { character, opponent } = state;
  
  const [playerHp, setPlayerHp] = useState(character?.hp || 100);
  const [opponentHp, setOpponentHp] = useState(opponent?.hp || 100);
  const [battlePanels, setBattlePanels] = useState<BattlePanel[]>([]);
  const [battleEnded, setBattleEnded] = useState(false);
  const [playerWon, setPlayerWon] = useState(false);
  
  const imageGeneration = useImageGeneration();
  const generatingPanels = useRef(new Set<number>());

  useEffect(() => {
    // Generate the first battle panel when component mounts
    if (state.selectedPower !== undefined && character && opponent) {
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      imageGeneration.cleanup();
    };
  }, [imageGeneration]);

  const generateFinalPanel = async (victory: boolean) => {
    if (!character) return;

    const finalPanelIndex = battlePanels.length;
    
    // Prevent duplicate generation
    if (generatingPanels.current.has(finalPanelIndex)) {
      return;
    }
    generatingPanels.current.add(finalPanelIndex);

    // Simplified final panel prompts focusing only on the player character
    const prompt = victory 
      ? `Epic fantasy victory portrait: ${character.character_name} (${character.image_prompt}) in a triumphant victory pose. ${character.description}. The hero stands proudly with glorious golden light rays surrounding them, magical victory energy swirling around their body, heroic stance with arms raised in celebration, epic fantasy art style, dramatic cinematic lighting, champion's glow, victory celebration, triumphant expression, battlefield smoke in background, high contrast, 16:9 aspect ratio.`
      : `Dark fantasy defeat portrait: ${character.character_name} (${character.image_prompt}) in a defeated state. ${character.description}. The fallen hero kneels or lies defeated, somber lighting with shadows, exhausted and wounded, dramatic defeat composition, dark fantasy art style, melancholic atmosphere, fallen warrior, tragic scene, battlefield debris around them, high contrast, 16:9 aspect ratio.`;

    setBattlePanels(prev => [
      ...prev,
      {
        id: `final-panel`,
        isGenerating: true,
        error: false,
        prompt,
        aspectRatio: '16:9',
        isFinalPanel: true
      }
    ]);

    try {
      const result = await imageGeneration.generateImage({
        prompt,
        aspectRatio: '16:9',
        cacheKey: `final-${victory ? 'victory' : 'defeat'}-${character.character_name}-${Date.now()}`,
      });
      
      setBattlePanels(prev => {
        const newPanels = [...prev];
        if (newPanels[finalPanelIndex]) {
          newPanels[finalPanelIndex] = {
            ...newPanels[finalPanelIndex],
            imageUrl: result.url,
            aspectRatio: '16:9',
            isGenerating: false,
            error: false
          };
        }
        return newPanels;
      });

    } catch (error) {
      console.error('Failed to generate final battle image:', error);
      setBattlePanels(prev => {
        const newPanels = [...prev];
        if (newPanels[finalPanelIndex]) {
          newPanels[finalPanelIndex] = {
            ...newPanels[finalPanelIndex],
            isGenerating: false,
            error: true
          };
        }
        return newPanels;
      });
    } finally {
      generatingPanels.current.delete(finalPanelIndex);
    }
  };

  const generateBattlePanel = async (panelIndex: number) => {
    if (!character || !opponent) return;

    // Prevent duplicate generation
    if (generatingPanels.current.has(panelIndex)) {
      return;
    }
    generatingPanels.current.add(panelIndex);

    const selectedPower = character.powers[state.selectedPower || 0];
    
    // Enhanced battle prompts with detailed character aesthetics
    const prompt = `Epic fantasy battle scene: ${character.character_name} (${character.image_prompt}) unleashing devastating ${selectedPower.name} attack against ${opponent.character_name} (${opponent.image_prompt}). 
    
    Action: ${selectedPower.description}. The attacker shows ${character.description} while the defender displays ${opponent.description}.
    
    Visual style: Intense combat action, explosive magical effects, dramatic lighting with sparks and energy, debris flying through the air, fierce expressions showing determination and pain, dynamic action poses mid-combat, cinematic battle photography, high contrast lighting, magical sparks and flames, destruction and chaos around them, epic confrontation, dark fantasy art style with vibrant magical effects.`;

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
      const result = await imageGeneration.generateImage({
        prompt,
        cacheKey: `battle-${panelIndex}-${character.character_name}-${selectedPower.name}-${Date.now()}`,
      });
      
      setBattlePanels(prev => {
        const newPanels = [...prev];
        if (newPanels[panelIndex]) {
          newPanels[panelIndex] = {
            ...newPanels[panelIndex],
            imageUrl: result.url,
            aspectRatio: result.aspectRatio,
            isGenerating: false,
            error: false
          };
        }
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
        if (newPanels[panelIndex]) {
          newPanels[panelIndex] = {
            ...newPanels[panelIndex],
            isGenerating: false,
            error: true
          };
        }
        return newPanels;
      });
    } finally {
      generatingPanels.current.delete(panelIndex);
    }
  };

  const handleAttack = async (powerIndex: number) => {
    if (!character || battleEnded) return;
    
    dispatch({ type: 'SELECT_POWER', payload: powerIndex });
    const nextPanelIndex = battlePanels.length;
    await generateBattlePanel(nextPanelIndex);
  };

  const retryPanel = (panelIndex: number) => {
    const panel = battlePanels[panelIndex];
    if (!panel) return;

    if (panel.isFinalPanel) {
      generateFinalPanel(playerWon);
    } else {
      generateBattlePanel(panelIndex);
    }
  };

  const goBackToBattle = () => {
    dispatch({ type: 'SELECT_POWER', payload: undefined });
  };

  if (!character || !opponent) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex">
      {/* Left Sidebar - Player Info */}
      <PlayerSidebar
        character={character}
        playerHp={playerHp}
        battleEnded={battleEnded}
        playerWon={playerWon}
        onGoBack={goBackToBattle}
        onAttack={handleAttack}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar - Opponent Info */}
        <OpponentHealthBar opponent={opponent} currentHp={opponentHp} />

        {/* Story Space - Comic Strip */}
        <BattleStoryArea
          battlePanels={battlePanels}
          playerWon={playerWon}
          onRetryPanel={retryPanel}
        />
      </div>
    </div>
  );
}
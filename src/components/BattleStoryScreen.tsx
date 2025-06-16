import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { PlayerSidebar } from './ui/PlayerSidebar';
import { OpponentHealthBar } from './ui/OpponentHealthBar';
import { BattleStoryArea } from './ui/BattleStoryArea';
import { FIXED_OPPONENT } from '../data/opponents';

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

    // Enhanced final panel prompts with detailed character aesthetics
    const winnerAesthetics = victory ? character.image_prompt : FIXED_OPPONENT.image_prompt;
    const loserAesthetics = victory ? FIXED_OPPONENT.image_prompt : character.image_prompt;
    const winnerName = victory ? character.character_name : FIXED_OPPONENT.character_name;
    const loserName = victory ? FIXED_OPPONENT.character_name : character.character_name;

    const prompt = victory 
      ? `Epic fantasy victory scene: ${winnerName} (${winnerAesthetics}) standing triumphantly over the defeated ${loserName} (${loserAesthetics}). The victor poses heroically with ${victory ? character.description : FIXED_OPPONENT.description}. Glorious golden light rays, magical victory energy swirling around the champion, debris and smoke from the intense battle, dramatic cinematic lighting, heroic stance, celebration of triumph, epic fantasy art style, high contrast, victory celebration, champion pose, battlefield aftermath, 16:9 aspect ratio.`
      : `Dark fantasy defeat scene: ${winnerName} (${winnerAesthetics}) standing victorious over the fallen ${loserName} (${loserAesthetics}). The victor dominates with ${victory ? character.description : FIXED_OPPONENT.description}. Ominous shadows, dark energy emanating from the victor, dramatic defeat composition, somber lighting, fallen hero, epic battle aftermath, dark fantasy art style, high contrast, defeat and loss, tragic scene, battlefield devastation, 16:9 aspect ratio.`;

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
    
    // Enhanced battle prompts with detailed character aesthetics
    const prompt = `Epic fantasy battle scene: ${character.character_name} (${character.image_prompt}) unleashing devastating ${selectedPower.name} attack against ${FIXED_OPPONENT.character_name} (${FIXED_OPPONENT.image_prompt}). 
    
    Action: ${selectedPower.description}. The attacker shows ${character.description} while the defender displays ${FIXED_OPPONENT.description}.
    
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

  if (!character) return null;

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
        <OpponentHealthBar opponent={FIXED_OPPONENT} currentHp={opponentHp} />

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
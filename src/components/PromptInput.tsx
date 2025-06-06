import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useGame } from '../context/GameContext';

export function PromptInput() {
  const [prompt, setPrompt] = useState('');
  const { dispatch } = useGame();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/character-creation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: prompt.trim() }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create character');
      }

      const character = await response.json();
      dispatch({ type: 'SET_CHARACTER', payload: character });
      setPrompt('');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your character..."
        className="w-full px-4 py-3 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
      />
      <button
        type="submit"
        disabled={!prompt.trim()}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md bg-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-500 transition-colors duration-200"
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
}
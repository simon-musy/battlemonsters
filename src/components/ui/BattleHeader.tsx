import React from 'react';

interface BattleHeaderProps {
  title: string;
  subtitle: string;
}

export function BattleHeader({ title, subtitle }: BattleHeaderProps) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
      <p className="text-purple-200">{subtitle}</p>
    </div>
  );
}
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SetupScreen } from './components/SetupScreen';
import { GameScreen } from './components/GameScreen';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { Team, Question, GameState, WheelItem, CardConfig } from './types';
import { DEFAULT_TEAMS, DEFAULT_QUESTIONS, REWARDS, PENALTIES, DEFAULT_CARD_CONFIG } from './constants';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('setup');
  const [teams, setTeams] = useState<Team[]>(DEFAULT_TEAMS);
  const [questions, setQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
  const [rewards, setRewards] = useState<WheelItem[]>(REWARDS);
  const [penalties, setPenalties] = useState<WheelItem[]>(PENALTIES);
  const [cardConfig, setCardConfig] = useState<CardConfig>(DEFAULT_CARD_CONFIG);

  const handleStart = () => {
    // Reset scores when starting a new game
    setTeams(teams.map((t) => ({ ...t, score: 0 })));
    setGameState('playing');
  };

  const handleFinish = () => {
    setGameState('leaderboard');
  };

  const handleRestart = () => {
    setGameState('setup');
  };

  return (
    <div className="font-sans antialiased bg-slate-900 min-h-screen">
      {gameState === 'setup' && (
        <SetupScreen
          teams={teams}
          setTeams={setTeams}
          questions={questions}
          setQuestions={setQuestions}
          rewards={rewards}
          setRewards={setRewards}
          penalties={penalties}
          setPenalties={setPenalties}
          cardConfig={cardConfig}
          setCardConfig={setCardConfig}
          onStart={handleStart}
        />
      )}
      {gameState === 'playing' && (
        <GameScreen
          teams={teams}
          setTeams={setTeams}
          questions={questions}
          rewards={rewards}
          penalties={penalties}
          cardConfig={cardConfig}
          onFinish={handleFinish}
          onBackToMenu={() => setGameState('setup')}
        />
      )}
      {gameState === 'leaderboard' && (
        <LeaderboardScreen
          teams={teams}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

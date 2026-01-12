"use client";

import styled from 'styled-components';
import { FaPlay, FaUserPlus, FaGamepad } from 'react-icons/fa';
import { useState } from 'react';
import { Player } from "@/types/player";
import { AstronautAvatar } from './avatar';

const LobbyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const PlayersGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  width: 100%;
  margin: 1rem 0;
`;

const PlayerCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
  min-width: 180px;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border-color: #4f46e5;
  }
`;

const PlayerName = styled.div`
  font-size: 1.1rem;
  color: #e2e8f0;
  text-align: center;
  font-weight: 500;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  &.host {
    color: #818cf8;
    font-weight: 600;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
  background: ${({ $variant }) => $variant === 'primary' ? '#4f46e5' : '#374151'};
  color: white;
  margin: 0.5rem 0;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Input = styled.input`
  padding: 0.85rem 1.25rem;
  border: 1px solid #4b5563;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 1rem;
  width: 100%;
  max-width: 300px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const GameControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  width: 100%;
  max-width: 400px;
  margin-top: 2rem;
  padding: 2rem;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  color: #6b7280;
  margin: 0.5rem 0;
  font-size: 0.9rem;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, #4b5563, transparent);
  }
`;

interface LobbyProps {
  onStartGame: () => void;
  players: Player[];
  onJoinGame?: (code: string) => void;
  onCreateGame?: () => void;
  isHost?: boolean;
}

export default function Lobby({ onStartGame, players, onJoinGame, onCreateGame, isHost = false }: LobbyProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);

  const handleJoinGame = () => {
    if (inviteCode.trim() && onJoinGame) {
      onJoinGame(inviteCode.trim().toUpperCase());
      setShowJoinForm(false);
    }
  };

  return (
    <LobbyContainer>
      <h2 style={{
        fontSize: '2.5rem',
        color: '#e2e8f0',
        marginBottom: '1rem',
        textAlign: 'center',
        background: 'linear-gradient(45deg, #818cf8, #c7d2fe)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        Lobby
      </h2>
      
      <PlayersGrid>
        {players.map((player) => (
          <PlayerCard key={player.uid}>
            <AstronautAvatar size={80} />
            <PlayerName className={player.playerId === 100 ? 'host' : ''}>
              {player.name}
              {player.playerId === 100 && ' (Host)'}
            </PlayerName>
          </PlayerCard>
        ))}
      </PlayersGrid>

      <GameControls>
        {!showJoinForm ? (
          <>
            <Button 
              onClick={() => onCreateGame?.()}
              $variant="primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <FaGamepad /> Create New Game
            </Button>
            
            <Divider>OR</Divider>
            
            <Button 
              onClick={() => setShowJoinForm(true)}
              $variant="secondary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <FaUserPlus /> Join Existing Game
            </Button>
          </>
        ) : (
          <>
            <div style={{ width: '100%', textAlign: 'center', marginBottom: '0.5rem' }}>
              <p style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}>Enter the invite code</p>
              <Input
                type="text"
                placeholder="e.g., ABC123"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={6}
                style={{ textAlign: 'center', letterSpacing: '0.5em' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
              <Button 
                onClick={handleJoinGame}
                $variant="primary"
                disabled={!inviteCode.trim()}
                style={{ flex: 1 }}
              >
                Join
              </Button>
              <Button 
                onClick={() => setShowJoinForm(false)}
                $variant="secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </GameControls>

      {isHost && players.length > 0 && (
        <Button 
          onClick={onStartGame}
          $variant="primary"
          style={{ 
            marginTop: '1rem',
            padding: '1rem 3rem',
            fontSize: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
          disabled={players.length < 1}
        >
          <FaPlay /> Start Game
        </Button>
      )}
    </LobbyContainer>
  );
}
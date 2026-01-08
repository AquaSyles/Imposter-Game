"use client";

import styled from 'styled-components';
import { FaPlay, FaPlus, FaMinus, FaUser } from 'react-icons/fa';
import { useState } from 'react';


const LobbyContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: #1e293b;
  border-radius: 0.7rem;
  box-shadow: 0 2px 20px 2px #737884;
  position: relative;
  z-index: 1;
`;



const AvatarGrid = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin: 2rem 0;
  padding: 1rem;
  border-bottom: 1px white solid;
  
`;

const Avatar = styled.div`
  width: 60px;
  height: 60px;
  border: 2px solid #4f46e5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1e293b;
  color: #e5e7eb;
  font-size: 1.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
  }
`;

const CounterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
`;

const CounterButton = styled.button`
  background: #4f46e5;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #4338ca;
    transform: scale(1.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const CounterValue = styled.span`
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  min-width: 50px;
  text-align: center;
`;

const PlayButton = styled.button`
  background: linear-gradient(45deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  margin-top: 40px;
  margin-left: 40%;
  font-size: 1.25rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    transition: transform 0.3s ease;
  }
  
  &:hover svg {
    transform: translateX(3px);
  }
`;

interface LobbyProps {
  onStartGame: () => void;
}

export default function Lobby({ onStartGame }: LobbyProps) {
  const [avatarCount, setAvatarCount] = useState(1);
  const maxAvatars = 10;
  const minAvatars = 1;

  const handleIncrement = () => {
    if (avatarCount < maxAvatars) {
      setAvatarCount(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (avatarCount > minAvatars) {
      setAvatarCount(prev => prev - 1);
    }
  };

  return (
    <>
      <LobbyContainer>
        <AvatarGrid>
          {Array.from({ length: avatarCount }).map((_, index) => (
            <Avatar key={index}>
              <FaUser />
            </Avatar>
          ))}
        </AvatarGrid>
        <CounterContainer>
          <CounterButton 
            onClick={handleDecrement} 
            disabled={avatarCount <= minAvatars}
            aria-label="Decrease player count"
          >
            <FaMinus />
          </CounterButton>
          <CounterValue>{avatarCount}</CounterValue>
          <CounterButton 
            onClick={handleIncrement} 
            disabled={avatarCount >= maxAvatars}
            aria-label="Increase player count"
          >
            <FaPlus />
          </CounterButton>
        </CounterContainer>
      </LobbyContainer>
      <PlayButton onClick={onStartGame}>
        Start Game
        <FaPlay />
      </PlayButton>
    </>
  );
}
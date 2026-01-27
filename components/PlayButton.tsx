"use client";

import { useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import {SiSpaceship} from 'react-icons/si';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
`;

const PlayButtonContainer = styled.button<{ $error?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 28px 0 32px;
  border: none;
  border-radius: 28px;
  background: ${({ $error }: { $error?: boolean }) => ($error ? '#ef4444' : '#3b82f6')};
  color: white;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  overflow: hidden;

  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    animation: ${pulse} 2s infinite;
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    animation: none;
    transform: none;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  &:disabled:hover {
    transform: none;
    animation: none;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  ${({ $error }: { $error?: boolean }) =>
    $error &&
    css`
      animation: shake 0.5s ease-in-out;
      background: #ef4444;
    `}
`;

const ButtonText = styled.span`
  position: relative;
  z-index: 1;
  margin-right: 12px;
  transition: transform 0.3s ease;
`;

const IconContainer = styled.span<{ $isHovered: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  
  transition: all 0.3s ease;

  svg {
    transition: transform 0.3s ease;
    ${({ $isHovered }: { $isHovered: boolean }) => $isHovered && 'transform: translateY(-15px);'}
  }
`;

interface PlayButtonProps {
  type?: 'button' | 'submit' | 'reset';
  error?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const PlayButton = ({ 
  type = 'submit', 
  error = false, 
  onClick,
  disabled = false,
}: PlayButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <PlayButtonContainer
      type={type}
      $error={error}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ButtonText>Play</ButtonText>
      <IconContainer $isHovered={isHovered}>
        <SiSpaceship  size={20} style={{ rotate: '90deg' }} />
      </IconContainer>
    </PlayButtonContainer>
  );
};

export default PlayButton;
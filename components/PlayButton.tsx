"use client";

import { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const PlayButtonContainer = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 28px 0 32px;
  border: none;
  border-radius: 28px;
  background: #3b82f6;
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
  width: 60px;
  height: 60px;
  border-radius: 50%;
  
  transition: all 0.3s ease;
  position: relative;

  svg {
    position: absolute;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  ${({ $isHovered }) => $isHovered ? css`
    svg:first-child {
      opacity: 0;
      transform: scale(0.5) rotate(-90deg);
    }
    svg:last-child {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }
  ` : css`
    svg:first-child {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }
    svg:last-child {
      opacity: 0;
      transform: scale(0.5) rotate(90deg);
    }
  `}
`;

const PlayButton = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <PlayButtonContainer
      type="submit"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ButtonText>Play</ButtonText>
      <IconContainer $isHovered={isHovered}>
        {/* Default SVG (sound waves) */}
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.0717 19.8211C18.8817 19.8211 18.6917 19.7511 18.5417 19.6011C18.2517 19.3111 18.2517 18.8311 18.5417 18.5411C22.1517 14.9311 22.1517 9.06109 18.5417 5.46109C18.2517 5.17109 18.2517 4.69109 18.5417 4.40109C18.8317 4.11109 19.3117 4.11109 19.6017 4.40109C23.7917 8.59109 23.7917 15.4111 19.6017 19.6011C19.4517 19.7511 19.2617 19.8211 19.0717 19.8211Z" fill="currentColor"/>
          <path d="M4.93031 19.8211C4.74031 19.8211 4.55031 19.7511 4.40031 19.6011C0.210312 15.4111 0.210312 8.59109 4.40031 4.40109C4.69031 4.11109 5.17031 4.11109 5.46031 4.40109C5.75031 4.69109 5.75031 5.17109 5.46031 5.46109C1.85031 9.07109 1.85031 14.9411 5.46031 18.5411C5.75031 18.8311 5.75031 19.3111 5.46031 19.6011C5.31031 19.7511 5.12031 19.8211 4.93031 19.8211Z" fill="currentColor"/>
          <path d="M11.9988 22.7119C10.7488 22.7019 9.55878 22.5019 8.44878 22.1119C8.05878 21.9719 7.84878 21.5419 7.98878 21.1519C8.12878 20.7619 8.54878 20.5519 8.94878 20.6919C9.90878 21.0219 10.9288 21.2019 12.0088 21.2019C13.0788 21.2019 14.1088 21.0219 15.0588 20.6919C15.4488 20.5619 15.8788 20.7619 16.0188 21.1519C16.1588 21.5419 15.9488 21.9719 15.5588 22.1119C14.4388 22.5019 13.2488 22.7119 11.9988 22.7119Z" fill="currentColor"/>
          <path d="M15.2988 3.33906C15.2188 3.33906 15.1288 3.32906 15.0488 3.29906C14.0988 2.95906 13.0688 2.78906 11.9988 2.78906C10.9288 2.78906 9.90878 2.96906 8.94878 3.29906C8.54878 3.42906 8.12878 3.22906 7.98878 2.83906C7.84878 2.44906 8.05878 2.01906 8.44878 1.87906C9.56878 1.48906 10.7588 1.28906 11.9988 1.28906C13.2388 1.28906 14.4388 1.48906 15.5488 1.87906C15.9388 2.01906 16.1488 2.44906 16.0088 2.83906C15.8988 3.14906 15.6088 3.33906 15.2988 3.33906Z" fill="currentColor"/>
          <path d="M8.73828 12.0001V10.3301C8.73828 8.25014 10.2083 7.40014 12.0083 8.44014L13.4583 9.28014L14.9083 10.1201C16.7083 11.1601 16.7083 12.8601 14.9083 13.9001L13.4583 14.7401L12.0083 15.5801C10.2083 16.6201 8.73828 15.7701 8.73828 13.6901V12.0001Z" fill="currentColor"/>
        </svg>
        
        {/* Hover SVG (play button) */}
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.97 22C17.4928 22 21.97 17.5228 21.97 12C21.97 6.47715 17.4928 2 11.97 2C6.44712 2 1.96997 6.47715 1.96997 12C1.96997 17.5228 6.44712 22 11.97 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8.73999 12.2299V10.5599C8.73999 8.47988 10.21 7.62988 12.01 8.66988L13.46 9.50988L14.91 10.3499C16.71 11.3899 16.71 13.0899 14.91 14.1299L13.46 14.9699L12.01 15.8099C10.21 16.8499 8.73999 15.9999 8.73999 13.9199V12.2299Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </IconContainer>
    </PlayButtonContainer>
  );
};

export default PlayButton;
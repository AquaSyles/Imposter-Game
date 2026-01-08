"use client";

import { useState, useEffect } from 'react';
import Lobby from "@/components/Lobby";
import Themes from "@/components/Themes";
import styled from 'styled-components';
import { FaCog, FaUser } from 'react-icons/fa';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
`;


const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  margin-left: 35%;
  background: linear-gradient(45deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const GlowEffect = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(99, 102, 241, 0.1) 0%,
    rgba(16, 24, 39, 0) 70%
  );
  pointer-events: none;
  z-index: 1;
`;

const MainContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  position: relative;
  z-index: 2;
`;

const PlayerContainer = styled.div`
 width: 300px;
 height: 150px;
 background: #1e293b;
 border: 1px  white solid;
 border-radius: 0 0 0 60px;
 position: absolute;
 top: -1px;
 right: -1px
`;
const Bar = styled.div`
display: flex;
gap: 5rem;
justify-content: center;
margin-top: 20px;
margin-left: -40px;


`;
const Avatar =  styled.div`
 width: 80px;
 height: 80px;
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

const Settings =  styled.div`
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
  cursor: pointer;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
  }
`;

const InviteCode = styled.div`
  margin-top: 1rem;
  text-align: center;
  color: #e5e7eb;
`;

const CodeDisplay = styled.div`
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-family: monospace;
  font-size: 1.25rem;
  letter-spacing: 0.2em;
  margin-top: 0.5rem;
  border: 1px solid #4f46e5;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(79, 70, 229, 0.2);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const CodeLabel = styled.div`
  font-size: 0.875rem;
  color: #94a3b8;
  margin-bottom: 0.25rem;
`;

const ViewContainer = styled.div<{ $isActive: boolean }>`
  width: 100%;
  transition: opacity 0.3s ease, transform 0.3s ease;
  position: ${({ $isActive }) => ($isActive ? 'relative' : 'absolute')};
  opacity: ${({ $isActive }) => ($isActive ? 1 : 0)};
  pointer-events: ${({ $isActive }) => ($isActive ? 'auto' : 'none')};
  transform: ${({ $isActive }) => ($isActive ? 'translateY(0)' : 'translateY(20px)')};
`;

export default function Home() {
  const [showThemes, setShowThemes] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar looking characters
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setInviteCode(code);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <PageContainer>
      <GlowEffect />
      <PlayerContainer>
        <Bar>
          <Avatar>
          <FaUser />
          </Avatar>
          <Settings>
            <FaCog/>
          </Settings>
        </Bar>
        <InviteCode>
          <CodeLabel>Invite Code</CodeLabel>
          <CodeDisplay onClick={copyToClipboard} title="Click to copy">
            {inviteCode || 'Generating...'}
            {isCopied && <span style={{
              marginLeft: '0.5rem',
              fontSize: '0.8rem',
              color: '#4ade80',
              opacity: isCopied ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}>Copied!</span>}
          </CodeDisplay>
        </InviteCode>
        
        </PlayerContainer>
      <MainContainer>
        <Title> Imposter Game</Title>
        <ViewContainer $isActive={!showThemes}>
          <Lobby onStartGame={() => setShowThemes(true)} />
        </ViewContainer>
        
        <ViewContainer $isActive={showThemes}>
          <Themes onBack={() => setShowThemes(false)} />
        </ViewContainer>
      </MainContainer>
    </PageContainer>
  );
}
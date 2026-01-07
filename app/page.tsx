"use client";

import { useState } from 'react';
import PlayButton from "@/components/PlayButton";
import Themes from "@/components/Themes";
import styled from 'styled-components';

const Section = styled.div`
  margin-bottom: 1.5rem;
  width: 100%;
`;

const PageContainer = styled.div`
  min-height: 100vh;
  background: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
`;

const GlowEffect = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(99, 102, 241, 0.15), transparent 70%);
  pointer-events: none;
  z-index: 1;
`;

const MainContainer = styled.div`
  background: #1e293b;
  border-radius: 1.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 
              0 10px 10px -5px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 64rem;
  position: relative;
  z-index: 2;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const FormTitle = styled.h1`

  color: white;
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 2rem;

  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`;

export default function Home() {
  const [hasError, setHasError] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Add your form submission logic here
  };

  return (
    <PageContainer>
      <GlowEffect />
      <MainContainer>
        <form onSubmit={handleSubmit} className="p-6 md:p-10">
          <FormTitle>Imposter Game</FormTitle>

          <Section>
            <Themes />
          </Section>

          <div className="flex justify-center mt-8">
          <PlayButton 
            type="submit" 
            error={hasError} 
            onClick={() => {}} // Add this if you need click handling
          />
          </div>
        </form>
      </MainContainer>
    </PageContainer>
  );
}
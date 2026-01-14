import React from "react";
import styled, { keyframes } from "styled-components";

type AstronautAvatarProps = {
  /** Size in px (square). Default 60 */
  size?: number;
  className?: string;
};

export const AstronautAvatar: React.FC<AstronautAvatarProps> = ({
  size = 60,
  className,
}) => {
  const BASE = 300;
  const scale = size / BASE;

  return (
    <Wrap
      className={className}
      style={
        {
          ["--scale" as any]: scale,
          ["--size" as any]: `${size}px`,
        } as React.CSSProperties
      }
    >
      <Stage>
        <Container>
          <Head>
            <Visor />
            <LeftEar>
              <LeftEarpot />
            </LeftEar>
            <RightEar>
              <RightEarpot />
            </RightEar>
          </Head>

          <Body>
            <Panel>
              <Sig1 />
              <Sig2 />
              <Sig3 />
              <Sig1 />
              <Sig2 />
              <Sig3 />
              <Sig1 />
              <Sig2 />
              <Sig3 />
              <Sig1 />
              <Sig2 />
              <Sig3 />
              <MainSig />
            </Panel>

            <LeftArm>
              <LeftGlove />
            </LeftArm>
            <RightArm>
              <RightGlove />
            </RightArm>
          </Body>
        </Container>
      </Stage>
    </Wrap>
  );
};

/* ---------------- animations ---------------- */

const blink1 = keyframes`
  0%{background-color:#ff0000;}
  10%{background-color:#ffd500;}
  20%{background-color:#00d9ff;}
  30%{background-color:#ff00c8;}
  40%{background-color:#00ff51;}
  50%{background-color:#fff200;}
  60%{background-color:#4c00ff;}
  70%{background-color:#99ff00;}
  80%{background-color:#ff00ee;}
  90%{background-color:#ff9500;}
  100%{background-color:#00ffd5;}
`;

const blink2 = keyframes`
  0%   { background-color: #ff005d; }
  8%   { background-color: #00f7ff; }
  16%  { background-color: #ffe600; }
  24%  { background-color: #7b00ff; }
  32%  { background-color: #00ff6a; }
  40%  { background-color: #ff3c00; }
  50%  { background-color: #00a2ff; }
  60%  { background-color: #ff00e6; }
  72%  { background-color: #b6ff00; }
  86%  { background-color: #ff9100; }
  100% { background-color: #00ffd5; }
`;

const blink3 = keyframes`
  0%   { background-color: #00d4ff; }
  12%  { background-color: #004cff; }
  24%  { background-color: #8c00ff; }
  36%  { background-color: #ff00aa; }
  48%  { background-color: #ff2a00; }
  60%  { background-color: #ffea00; }
  72%  { background-color: #3cff00; }
  84%  { background-color: #00ffb3; }
  92%  { background-color: #00aaff; }
  100% { background-color: #00d4ff; }
`;

const mainBlink = keyframes`
  0%   { background-color: rgb(255, 9, 9); }
  50%  { background-color: rgb(255, 254, 224); }
  100% { background-color: rgb(255, 9, 9); }
`;

/* ---------------- layout ---------------- */

const Wrap = styled.div`
  width: var(--size, 60px);
  height: var(--size, 60px);
  display: inline-block;

  border: 2px solid #4f46e5;
  border-radius: 50%;
  background: #1e293b;
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
  transition: all 0.2s ease;

  overflow: hidden;          /* ✅ klipper alt inni sirkelen */
  position: relative;        /* ✅ for å plassere Stage absolutt */

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.8);
  }
`;

/**
 * Stage er 300x300 (original design) og vi SENTRERER den i Wrap.
 * NB: translate først, så scale, ellers blir den forskjøvet.
 */
const Stage = styled.div`
  width: 300px;
  height: 300px;
  position: absolute;
  left: 50%;
  top: 50%;

  transform: translate(-50%, -50%) scale(var(--scale, 0.2));
  transform-origin: center;

  pointer-events: none;
`;

/* Container circle (original) - gir riktig clipping og layout inni 300x300 */
const Container = styled.div`
  width: 300px;
  height: 300px;
  border-radius: 50%;
  position: relative;
  overflow: hidden;   /* ✅ klipp inni originalsirkel også */
`;

/* ---------------- avatar parts ---------------- */

const Head = styled.div`
  width: 120px;
  height: 120px;
  position: absolute;
  left: 50%;
  top: 40px;
  transform: translateX(-50%);
  border-radius: 45px 45px 5px 5px;
  border: 1px solid black;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Visor = styled.div`
  width: 100%;
  height: 30%;
  background-color: rgb(0, 0, 0);
  border-radius: 40px 40px 100px 100px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
`;

const LeftEar = styled.div`
  width: 10px;
  height: 30px;
  position: absolute;
  left: -10px;
  top: 40px;
  background-color: #ffffff;
  border: 1px solid black;
  border-radius: 10px 0 0 10px;
`;

const RightEar = styled.div`
  width: 10px;
  height: 30px;
  position: absolute;
  right: -10px;
  top: 40px;
  background-color: #ffffff;
  border: 1px solid black;
  border-radius: 0 10px 10px 0;
`;

const LeftEarpot = styled.div`
  width: 5px;
  height: 25px;
  position: absolute;
  right: 0px;
  top: 2px;
  background-color: #969696;
  border: 1px solid black;
  border-radius: 40px 0 0 40px;
`;

const RightEarpot = styled.div`
  width: 5px;
  height: 25px;
  position: absolute;
  left: 0px;
  top: 2px;
  background-color: #969696;
  border: 1px solid black;
  border-radius: 0 40px 40px 0;
`;

const Body = styled.div`
  width: 140px;
  height: 140px;
  position: absolute;
  left: 50%;
  top: 160px;
  transform: translateX(-50%);
  background-color: #ffffff;
  border: 1px solid black;
  border-radius: 20px 20px 45px 45px;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const Panel = styled.div`
  padding: 4px;
  width: 80px;
  height: 60px;
  margin-top: -40px;
  background-color: #b5b5b5;
  border: 1px solid black;
  border-radius: 10px;

  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  gap: 4px;
`;

const SignalDot = styled.div`
  width: 5px;
  height: 5px;
  border: 1px solid black;
  border-radius: 5px;
`;

const Sig1 = styled(SignalDot)`
  animation: ${blink1} 8s infinite;
`;
const Sig2 = styled(SignalDot)`
  animation: ${blink2} 8s infinite;
`;
const Sig3 = styled(SignalDot)`
  animation: ${blink3} 8s infinite;
`;

const MainSig = styled.div`
  width: 40px;
  height: 10px;
  border: 1px solid black;
  border-radius: 5px;
  margin-top: 5px;
  animation: ${mainBlink} 5s infinite;
`;

/* arms - behold look, men de vil nå klippes riktig i sirkel */
const LeftArm = styled.div`
  width: 30px;
  height: 80px;
  position: absolute;
  left: -25px;
  top: 5px;
  background-color: #ffffff;
  border: 1px solid black;
  border-radius: 25px 0 0 0;
`;

const RightArm = styled.div`
  width: 30px;
  height: 80px;
  position: absolute;
  right: -25px;
  top: 5px;
  background-color: #ffffff;
  border: 1px solid black;
  border-radius: 0 25px 0 0;
`;

const LeftGlove = styled.div`
  width: 30px;
  height: 20px;
  position: absolute;
  top: 70px;
  left: -1px;
  background-color: #cccccc;
  border: 1px solid black;
  border-radius: 0 0 10px 10px;
`;

const RightGlove = styled(LeftGlove)``;

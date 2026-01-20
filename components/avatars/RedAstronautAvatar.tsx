"use client";

import React from "react";
import styled, { keyframes } from "styled-components";

type RedAstronautAvatarProps = {
  /** Size in px (square). Default 60 */
  size?: number;
  className?: string;
};

export const RedAstronautAvatar: React.FC<RedAstronautAvatarProps> = ({
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
            <HeadOverlay />
            <HeadOverlay1 />
            <HeadOverlay2 />

            <HelmetElement>
              <Stripe id="L1" />
              <Stripe id="L2" />
              <Stripe id="L3" />
              <Stripe id="L4" />
              <Stripe id="L5" />
              <Stripe />
              <Stripe />
              <Stripe />
              <Stripe />
              <Stripe />
              <Stripe />
              <Stripe id="R1" />
              <Stripe id="R2" />
              <Stripe id="R3" />
              <Stripe id="R4" />
              <Stripe id="R5" />
            </HelmetElement>

            <Visor />

            <LeftEar>
              <LeftEarpot />
            </LeftEar>
            <RightEar>
              <RightEarpot />
            </RightEar>
          </Head>
          

          <Backpack>
              <BackpackStripe id="BS_FR" />
              <BackpackStripe />
              <BackpackStripe />
              <BackpackStripe />
              <BackpackStripe />
              <BackpackStripe />
              <BackpackStripe />
              <BackpackStripe />
              <BackpackStripe />
              <BackpackStripe />
              <BackpackStripe id="BS_FL" />
            </Backpack>

          <Body>
            <BodyStripe id="left_S" />
            <BodyStripe id="right_S" />

            <Panel>
              <PanelSignalsMain />
            </Panel>

            <Belt>
              <BeltDetail />
              <Buckel />
              <BeltDetail />
            </Belt>

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

const mainBlink = keyframes`
  0% { background-color: rgb(0, 153, 255); }
  50% { background-color: rgb(224, 249, 255); }
  100% { background-color: rgb(0, 153, 255); }
`;

/* ---------------- layout (SAME STRUCTURE AS YOUR OTHER AVATAR) ---------------- */
const Wrap = styled.div`
  width: var(--size, 60px);
  height: var(--size, 60px);
  display: inline-block;

  border: 2px solid var(--ring, #4f46e5);
  border-radius: 50%;
  background: #1e293b;

  box-shadow: 0 0 15px color-mix(in srgb, var(--ring, #4f46e5) 55%, transparent);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

  overflow: hidden;
  position: relative;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 22px color-mix(in srgb, var(--ring, #4f46e5) 78%, transparent);
  }
`;



const Stage = styled.div`
  width: 300px;
  height: 300px;
  position: absolute;
  left: 50%;
  top: 50%;

  transform: translate(-50%, -50%) scale(var(--scale, 0.2));
  transform-origin: center;

  /* ✅ kun innhold farges, ringen påvirkes ikke */
  filter: var(--avatarFilter, none);

  pointer-events: none;
`;



const Container = styled.div`
  width: 300px;
  height: 300px;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
`;

/* ---------------- parts (UNCHANGED STYLING) ---------------- */

const Head = styled.div`
  width: 120px;
  height: 120px;
  margin-top: 40px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 55px 55px 55px 55px;
  border: 1px solid black;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const HeadOverlay = styled.div`
  width: 120px;
  height: 100px;
  margin-top: -20px;
  position: absolute;
  border-radius: 55px 55px 55px 55px;
  border: 1px solid black;
  background-color: #ffffff;
  z-index: 2;
`;

const HeadOverlay1 = styled.div`
  width: 113px;
  height: 40px;
  margin-top: -55px;
  position: absolute;
  border-radius: 55px 55px 55px 55px;
  background-color: #ca2a2a;
  z-index: 2;
`;

const HeadOverlay2 = styled.div`
  width: 120px;
  height: 40px;
  margin-top: -30px;
  position: absolute;
  border-radius: 55px 55px 55px 55px;
  background-color: #ffffff;
  z-index: 2;
`;

const LeftEar = styled.div`
  width: 10px;
  height: 30px;
  position: absolute;
  left: -12px;
  top: 40px;
  background-color: #ffffff;
  border: 1px solid black;
  border-radius: 10px 0 0 10px;
`;

const RightEar = styled.div`
  width: 10px;
  height: 30px;
  position: absolute;
  right: -12px;
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

const Visor = styled.div`
  width: 100%;
  height: 50%;
  margin-top: 20px;
  background-color: rgb(0, 0, 0);
  border-radius: 40px 40px 100px 100px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  z-index: 2;
`;

const HelmetElement = styled.div`
  width: 120px;
  height: 90px;
  margin-top: 10px;
  position: absolute;
  border-radius: 45px 45px 55px 55px;
  border: 1px solid black;
  background-color: #cccccc;
  display: flex;
  flex-direction: row;
  gap: 3px;
  justify-content: center;
  align-items: center;
  z-index: 1;
`;

const Stripe = styled.div`
  width: 2px;
  height: 100%;
  background-color: #7c7c7c;
  margin: 2px 0;
  border: 1px solid black;
  z-index: 1;

  /* height variants via id */
  &#L1,
  &#R5 {
    height: 45%;
    border-radius: 30%;
  }
  &#L2,
  &#R4 {
    height: 65%;
    border-radius: 30%;
  }
  &#L3,
  &#R3 {
    height: 80%;
    border-radius: 30%;
  }
  &#L4,
  &#R2 {
    height: 90%;
    border-radius: 30%;
  }
  &#L5,
  &#R1 {
    height: 95%;
    border-radius: 30%;
  }
`;

const Body = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 140px;
  height: 140px;
  position: absolute;
  left: 50%;
  top: 160px;
  transform: translateX(-50%);
  background-color: #ffffff;
  border: 1px solid black;
  border-radius: 20px 20px 45px 45px;
`;

const Backpack = styled.div`
  width: 140px;
  height: 160px;
  position: absolute;
  left: 50%;
  top: 160px;                 /* samme “område” som body */
  transform: translateX(-50%);
  margin-top: -25px;

  display: flex;
  flex-direction: row;
  justify-content: space-around;
  gap: 5px;

  background-color: #ffffff;
  border-top: 4px solid rgb(165, 165, 165);
  border-left: 2px solid rgb(165, 165, 165);
  border-right: 2px solid rgb(165, 165, 165);
  border-bottom: 1px solid rgb(165, 165, 165);
  border-radius: 35px 35px 25px 25px;

  z-index: -10;                 /* ✅ bak */
`;

const BackpackStripe = styled.div`
  width: 3px;
  height: 140px;
  background-color: #969696;
  border-radius: 25px 25px 30px 30px;

  &#BS_FR,
  &#BS_FL {
    margin-top: 12px;
    height: 120px;
  }
`;

const BodyStripe = styled.div`
  width: 20px;
  height: 175px;
  position: absolute;
  margin-top: -10px;
  background-color: #ca2a2a;
  border: 1px solid black;
  border-radius: 25px 25px 30px 30px;

  &#left_S {
    transform: rotate(45deg);
  }
  &#right_S {
    transform: rotate(-45deg);
  }
`;

const Panel = styled.div`
  display: flex;
  width: 50px;
  height: 50px;
  margin-top: -30px;
  background-color: #e9e9e9;
  border: 1px solid black;
  border-radius: 50%;
  z-index: 2;
`;

const PanelSignalsMain = styled.div`
  position: relative;
  margin: auto;
  width: 40px;
  height: 40px;
  border: 1px solid black;
  border-radius: 50%;
  animation: ${mainBlink} 5s infinite;
`;

const Belt = styled.div`
  width: 130px;
  height: 22px;
  position: absolute;
  margin-bottom: -115px;
  background-color: #b5b5b5;
  border: 1px solid black;
  border-radius: 10px 10px 25px 25px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 10px;
  align-items: center;
`;

const Buckel = styled.div`
  width: 40px;
  height: 15px;
  background-color: #969696;
  border: 1px solid black;
  border-radius: 5px;
`;

const BeltDetail = styled.div`
  width: 10px;
  height: 22px;
  margin: 0 5px;
  background-color: #7c7c7c;
  border: 1px solid black;
  border-radius: 3px;
`;

const LeftArm = styled.div`
  width: 30px;
  height: 80px;
  position: absolute;
  margin-left: -160px;
  margin-top: -50px;
  background-color: #ffffff;
  border: 1px solid black;
  border-radius: 25px 0 0 0;
`;

const RightArm = styled.div`
  width: 30px;
  height: 80px;
  position: absolute;
  margin-right: -160px;
  margin-top: -50px;
  background-color: #ffffff;
  border: 1px solid black;
  border-radius: 0 25px 0 0;
`;

const LeftGlove = styled.div`
  width: 30px;
  height: 20px;
  position: absolute;
  margin-top: 78px;
  left: -1px;
  background-color: #ca2a2a;
  border: 1px solid black;
  border-radius: 0 0 10px 10px;
`;

const RightGlove = styled(LeftGlove)``;

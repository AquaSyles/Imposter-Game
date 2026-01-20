"use client";

import React from "react";
import styled, { keyframes } from "styled-components";

export type RobotAvatarProps = {
  /** Size in px (square). Default 60 */
  size?: number;
  className?: string;
};

export const RobotAvatar: React.FC<RobotAvatarProps> = ({ size = 60, className }) => {
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
            <HeadPanel>
              <Rivet className="r1" />
              <Rivet className="r2" />
              <Rivet className="r3" />
              <Rivet className="r4" />
            </HeadPanel>

            <Eyes>
              <Eye>
                {Array.from({ length: 10 }).map((_, i) => (
                  <EyeLine key={i} />
                ))}
              </Eye>
              <Eye>
                {Array.from({ length: 10 }).map((_, i) => (
                  <EyeLine key={i} />
                ))}
              </Eye>
            </Eyes>

            <LeftEar>
              <LeftStick>
                <LeftEarpot />
                <Bulb_L />
              </LeftStick>
            </LeftEar>

            <RightEar>
              <RightStick>
                <RightEarpot />
                <Bulb_R />
              </RightStick>
            </RightEar>

            <Mouth>
              {Array.from({ length: 16 }).map((_, i) => (
                <Tooth key={i} />
              ))}
            </Mouth>
          </Head>

          <Neck>
            {Array.from({ length: 6 }).map((_, i) => (
              <NeckLine key={i} />
            ))}
          </Neck>
            <LeftArmShoulder />
             <RightArmShoulder />
          <Body>
            <ChestPlate>
              <PlateBolt className="b1" />
              <PlateBolt className="b2" />
              <PlateBolt className="b3" />
              <PlateBolt className="b4" />
              <PlateBolt className="b5" />
              <PlateBolt className="b6" />
              <PlateBolt className="b7" />
              <PlateBolt className="b8" />
            </ChestPlate>

            <Panel>
              <Bar style={{ ["--delay" as any]: "-1.3s" }} />
              <Bar style={{ ["--delay" as any]: "-2.2s" }} />
              <Bar style={{ ["--delay" as any]: "-4.1s" }} />
              <Bar style={{ ["--delay" as any]: "0s" }} />
              <Bar style={{ ["--delay" as any]: "3.1s" }} />
            </Panel>
            <PanelGlass />

            
            <LeftArm>
              <ArmJoint />
              <ClawR style={{ ["--delay" as any]: "0s" }} />
              <ClawL style={{ ["--delay" as any]: "0s" }} />
            </LeftArm>

           
            <RightArm>
              <ArmJoint />
              <ClawR style={{ ["--delay" as any]: "3.1s" }} />
              <ClawL style={{ ["--delay" as any]: "3.1s" }} />
            </RightArm>
          </Body>
        </Container>
      </Stage>
    </Wrap>
  );
};

/* ---------------- animations ---------------- */

const blink = keyframes`
  0% { box-shadow: 0px 0px 10px 5px #ff0000; background-color: #ff0000; }
  50% { box-shadow: 0px 0px 10px 5px #ff000000; background-color: #353535; }
  100% { box-shadow: 0px 0px 10px 5px #ff0000; background-color: #ff0000; }
`;

const expand = keyframes`
  0% { height: 25px; }
  10% { height: 50px; }
  20% { height: 15px; }
  30% { height: 40px; }
  40% { height: 20px; }
  50% { height: 45px; }
  60% { height: 30px; }
  70% { height: 50px; }
  80% { height: 20px; }
  90% { height: 40px; }
  100% { height: 25px; }
`;

const rotateClaw1 = keyframes`
  0% { transform: rotate(10deg); }
  10% { transform: rotate(-10deg); }
  20% { transform: rotate(-15deg); }
  30% { transform: rotate(20deg); }
  40% { transform: rotate(30deg); }
  50% { transform: rotate(10deg); }
  60% { transform: rotate(-25deg); }
  70% { transform: rotate(-20deg); }
  80% { transform: rotate(15deg); }
  90% { transform: rotate(-5deg); }
  100% { transform: rotate(10deg); }
`;

const rotateClaw2 = keyframes`
  0% { transform: rotate(-10deg); }
  10% { transform: rotate(10deg); }
  20% { transform: rotate(15deg); }
  30% { transform: rotate(-20deg); }
  40% { transform: rotate(-30deg); }
  50% { transform: rotate(-10deg); }
  60% { transform: rotate(25deg); }
  70% { transform: rotate(20deg); }
  80% { transform: rotate(-15deg); }
  90% { transform: rotate(5deg); }
  100% { transform: rotate(-10deg); }
`;

/* ---------------- layout (same pattern as your other avatars) ---------------- */

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

/* ---------------- robot parts (ported from your HTML/CSS) ---------------- */

const Head = styled.div`
  width: 120px;
  height: 100px;
  top: 42px;
  left: 50%;
  transform: translateX(-50%);
  position: absolute;
  border-radius: 5px;
  border: 1px solid black;
  background-color: #b5b5b5;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const HeadPanel = styled.div`
  position: absolute;
  width: 110px;
  height: 90px;
  background-color: #b5b5b5;
  border: 1px solid black;
  border-radius: 5px;
`;

const Rivet = styled.div`
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #868686;
  border: 1px solid #2f2f2f;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25);

  &.r1 { left: 4px; top: 4px; }
  &.r2 { right: 4px; top: 4px; }
  &.r3 { left: 4px; bottom: 4px; }
  &.r4 { right: 4px; bottom: 4px; }
`;

const Eyes = styled.div`
  width: 100%;
  height: 30%;
  top: 25px;
  position: absolute;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  gap: 1px;
`;

const Eye = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2px;
  justify-content: center;
  width: 30px;
  height: 30px;

  background: radial-gradient(
    circle at 35% 35%,
    #ff6a6a 0%,
    #ff1e1e 40%,
    #9b0000 70%,
    #5a0000 100%
  );

  border-radius: 50%;
  border: 3px solid #2f2f2f;

  box-shadow:
    0 0 8px rgba(255, 73, 73, 0.55),
    inset 0 0 6px rgba(109, 40, 40, 0.8);

  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    top: 5px;
    left: 7px;
    width: 45%;
    height: 45%;
    background: rgba(255, 97, 97, 0.25);
    border-radius: 50%;
    transform: rotate(-20deg);
  }
`;

const EyeLine = styled.div`
  position: relative;
  width: 1px;
  height: 100%;
  background-color: #3d3d3d;
`;

const Mouth = styled.div`
  width: 70px;
  height: 20px;
  position: absolute;
  bottom: 10px;
  border: 2px solid #3d3d3d;
  background: rgba(0, 0, 0, 0.06);
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.15);
  border-radius: 5px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.10) 0px,
      rgba(0, 0, 0, 0.10) 4px,
      rgba(255, 255, 255, 0.06) 4px,
      rgba(255, 255, 255, 0.06) 7px
    );
    opacity: 0.55;
    pointer-events: none;
  }
`;

const Tooth = styled.div`
  width: 8px;
  height: 8px;
  background-color: #ececec;
  border: 1px solid black;
`;

const LeftEar = styled.div`
  width: 60px;
  height: 40px;
  position: absolute;
  left: -62px;
  top: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const RightEar = styled(LeftEar)`
  left: auto;
  right: -62px;
`;

const LeftStick = styled.div`
  width: 30px;
  height: 5px;
  right: 0px;
  position: absolute;
  background-color: #7a7a7a;
  border: 1px solid black;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const RightStick = styled(LeftStick)`
  right: auto;
  left: 0px;
`;

const LeftEarpot = styled.div`
  width: 5px;
  height: 25px;
  position: absolute;
  right: -3px;
  background-color: #969696;
  border: 1px solid black;
  border-radius: 40px 0 0 40px;
`;

const RightEarpot = styled.div`
  width: 5px;
  height: 25px;
  position: absolute;
  left: -3px;
  background-color: #969696;
  border: 1px solid black;
  border-radius: 0 40px 40px 0;
`;

const Bulb_L = styled.div`
right: 20px;
  width: 15px;
  height: 15px;
  position: absolute;
  background-color: #ff0000;
  border: 1px solid black;
  border-radius: 50%;
  box-shadow: 0px 0px 15px #ff0000;
  animation: ${blink} 2s infinite;
`;

const Bulb_R = styled.div`
left: 20px;
  width: 15px;
  height: 15px;
  position: absolute;
  background-color: #ff0000;
  border: 1px solid black;
  border-radius: 50%;
  box-shadow: 0px 0px 15px #ff0000;
  animation: ${blink} 2s infinite;
`;

const Neck = styled.div`
  position: absolute;
  left: 50%;
  top: 141px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 2px;
  width: 60px;
  height: 20px;
  border: 1px solid black;
  background-color: #a1a1a1;
  z-index: -1;
`;

const NeckLine = styled.div`
  width: 100%;
  height: 1px;
  background-color: #3d3d3d;
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
  background-color: #b5b5b5;
  border: 1px solid black;
  border-radius: 10px 10px 45px 45px;
`;

const ChestPlate = styled.div`
  position: absolute;
  width: 130px;
  height: 130px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.10);
  border: 1px solid rgba(0, 0, 0, 0.6);
  border-radius: 10px 10px 45px 45px;
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.12);
  z-index: 1;
`;

const PlateBolt = styled.div`
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #777;
  border: 1px solid #2f2f2f;

  &.b1 { left: 4px; top: 4px; }
  &.b2 { right: 4px; top: 4px; }
  &.b3 { left: 20px; bottom: 10px; }
  &.b4 { right: 20px; bottom: 10px; }
  &.b5 { left: 50%; top: 4px; transform: translateX(-50%); }
  &.b6 { left: 4px; top: 50%; transform: translateY(-50%); }
  &.b7 { right: 4px; top: 50%; transform: translateY(-50%); }
  &.b8 { left: 50%; bottom: 4px; transform: translateX(-50%); }
`;

const Panel = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 4px;
  align-items: end;
  width: 60px;
  height: 60px;
  margin-top: -30px;
  background-color: #ffe0c7;
  border: 1px solid black;
  border-radius: 5px;
  z-index: 4;
`;

const PanelGlass = styled.div`
  position: absolute;
  width: 60px;
  height: 60px;
  margin-top: -30px;
  background-color: #defeffc3;
  border: 1px solid black;
  border-radius: 5px;
  z-index: 5;
`;

const Bar = styled.div`
  position: relative;
  width: 35px;
  height: 25px;
  background-color: #028400;
  
  bottom: 0px;
  animation: ${expand} 25s ease-in-out infinite;
  animation-delay: var(--delay, 0s);
`;

const LeftArmShoulder = styled.div`
  width: 30px;
  height: 15px;
  position: absolute;
  left: 60px;
  top: 170px;
  background-color: #a1a1a1;
  border: 1px solid black;
  z-index: 0;
`;

const RightArmShoulder = styled(LeftArmShoulder)`
  left: auto;
  right: 60px;
`;

const LeftArm = styled.div`
  width: 25px;
  height: 70px;
  position: absolute;
  left: -35px;
  top: 2px;
  background-color: #b5b5b5;
  border: 1px solid black;
  border-radius: 25px 0 0 0;
`;

const RightArm = styled(LeftArm)`
  left: auto;
  right: -35px;
  border-radius: 0 25px 0 0;
`;

const ArmJoint = styled.div`
  width: 28px;
  height: 28px;
  position: absolute;
  top: 50px;
  left: -2px;
  background-color: #868686;
  border: 1px solid black;
  border-radius: 50%;
  z-index: 2;
`;

const ClawR = styled.div`
  width: 8px;
  height: 20px;
  position: absolute;
  top: 70px;
  right: -2px;
  background-color: #707070;
  border: 1px solid black;
  border-radius: 2px 2px 10px 0px;
  animation: ${rotateClaw1} 20s infinite;
  animation-delay: var(--delay, 0s);
`;

const ClawL = styled.div`
  width: 8px;
  height: 20px;
  position: absolute;
  top: 70px;
  left: -2px;
  background-color: #707070;
  border: 1px solid black;
  border-radius: 2px 2px 0px 10px;
  animation: ${rotateClaw2} 20s infinite;
  animation-delay: var(--delay, 0s);
`;

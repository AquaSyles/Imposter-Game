"use client";

import { useMemo, useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { useTheme } from "./ThemeContext";
import { setLobbyTheme } from "@/firebase/lobby";
import PlayButton from "./PlayButton";

/* ---------------- DATA: ORDBANK ---------------- */

export const WORD_DATA: Record<string, string[]> = {
  Forest: ["Tree", "Bear", "Mushroom", "Cabin", "Path", "Wolf", "Owl", "Campfire"],
  Mountains: ["Snow", "Climbing", "Goat", "Peak", "Skiing", "Yeti", "Cave", "Echo"],
  Beach: ["Sand", "Ocean", "Sun", "Crab", "Towel", "Surfing", "Shell", "Shark"],
  Desert: ["Cactus", "Camel", "Sand", "Scorpion", "Oasis", "Pyramid", "Heat", "Lizard"],
  Jungle: ["Tiger", "Vine", "Monkey", "Rain", "Snake", "Parrot", "Waterfall", "Jaguar"],
  Arctic: ["Penguin", "Ice", "Polar Bear", "Snow", "Igloo", "Seal", "Cold", "Glacier"],

  Animals: ["Lion", "Elephant", "Giraffe", "Zebra", "Monkey", "Tiger", "Kangaroo", "Panda"],
  Mammals: ["Lion", "Dog", "Cat", "Human", "Whale", "Bat", "Horse", "Mouse"],
  Birds: ["Eagle", "Penguin", "Parrot", "Owl", "Duck", "Chicken", "Peacock", "Swan"],
  Reptiles: ["Snake", "Lizard", "Turtle", "Crocodile", "Chameleon", "Gecko", "Iguana", "Cobra"],
  Amphibians: ["Frog", "Toad", "Salamander", "Newt", "Tadpole", "Axolotl"],
  Fish: ["Shark", "Goldfish", "Salmon", "Tuna", "Clownfish", "Piranha", "Eel", "Stingray"],
  Insects: ["Ant", "Bee", "Butterfly", "Spider", "Mosquito", "Beetle", "Fly", "Worm"],

  Fruits: ["Apple", "Banana", "Orange", "Grape", "Strawberry", "Watermelon", "Lemon", "Cherry"],
  Vegetables: ["Carrot", "Potato", "Broccoli", "Corn", "Onion", "Tomato", "Spinach", "Pepper"],
  Desserts: ["Cake", "Ice Cream", "Chocolate", "Cookie", "Donut", "Pie", "Brownie", "Pudding"],
  Beverages: ["Water", "Coffee", "Tea", "Soda", "Juice", "Milk", "Beer", "Wine"],
  Snacks: ["Chips", "Popcorn", "Nuts", "Pretzel", "Candy", "Cracker", "Cheese", "Jerky"],
  Meals: ["Pizza", "Burger", "Pasta", "Sushi", "Steak", "Taco", "Soup", "Salad"],

  Doctor: ["Hospital", "Stethoscope", "Medicine", "Nurse", "Surgery", "Patient", "White Coat"],
  Engineer: ["Blueprint", "Bridge", "Math", "Helmet", "Computer", "Build", "Machine"],
  Teacher: ["School", "Chalkboard", "Student", "Book", "Homework", "Classroom", "Apple"],
  Artist: ["Paint", "Brush", "Canvas", "Color", "Gallery", "Sculpture", "Sketch"],
  Scientist: ["Lab", "Experiment", "Chemical", "Microscope", "Coat", "Discovery", "Formula"],
  Chef: ["Kitchen", "Knife", "Hat", "Cooking", "Restaurant", "Recipe", "Oven", "Taste"],

  Gadgets: ["Phone", "Watch", "Tablet", "Camera", "Headphones", "Drone", "Laptop"],
  AI: ["Robot", "Code", "Future", "Smart", "Computer", "Data", "Brain"],
  Programming: ["Code", "Bug", "Laptop", "Coffee", "Keyboard", "Screen", "Developer"],
  Robotics: ["Metal", "Battery", "Wire", "Motor", "Sensor", "Cyborg", "Factory"],
  "Space Tech": ["Rocket", "Satellite", "Rover", "Station", "Telescope", "Suit", "Launch"],
  "VR/AR": ["Goggles", "Virtual", "Game", "3D", "Headset", "Reality", "Motion"],

  Soccer: ["Ball", "Goal", "Grass", "Referee", "Team", "Kick", "World Cup"],
  Basketball: ["Hoop", "Court", "Dunk", "Net", "Jersey", "NBA", "Dribble"],
  Tennis: ["Racket", "Net", "Ball", "Court", "Serve", "Wimbledon", "Love"],
  Swimming: ["Pool", "Water", "Goggles", "Race", "Dive", "Swimsuit", "Stroke"],
  Athletics: ["Run", "Jump", "Track", "Gold", "Sprint", "Hurdle", "Relay"],
  Cycling: ["Bike", "Helmet", "Road", "Tour", "Wheel", "Pedal", "Race"],

  Planets: ["Mars", "Venus", "Jupiter", "Saturn", "Earth", "Neptune", "Mercury", "Uranus"],
  Movies: ["Popcorn", "Cinema", "Actor", "Screen", "Ticket", "Hollywood", "Director", "Oscar"],
  "Video Games": ["Controller", "Console", "Level", "Boss", "Score", "Player", "Online"],
  Landscapes: ["Mountain", "River", "Valley", "Ocean", "Desert", "Forest", "City"],
};

const ITEM_EMOJIS: Record<string, string> = {
  // Nature
  Forest: "🌲",
  Mountains: "⛰️",
  Beach: "🏖️",
  Desert: "🏜️",
  Jungle: "🌴",
  Arctic: "❄️",

  // Animals
  Mammals: "🐶",
  Birds: "🐦",
  Reptiles: "🦎",
  Amphibians: "🐸",
  Fish: "🐟",
  Insects: "🐞",

  // Food & Drink
  Fruits: "🍎",
  Vegetables: "🥕",
  Desserts: "🍰",
  Beverages: "🥤",
  Snacks: "🍿",
  Meals: "🍽️",

  // Careers
  Doctor: "🩺",
  Engineer: "🛠️",
  Teacher: "📚",
  Artist: "🎨",
  Scientist: "🔬",
  Chef: "👨‍🍳",

  // Technology
  Gadgets: "📱",
  AI: "🤖",
  Programming: "💻",
  Robotics: "🦾",
  "Space Tech": "🚀",
  "VR/AR": "🕶️",

  // Sports
  Soccer: "⚽",
  Basketball: "🏀",
  Tennis: "🎾",
  Swimming: "🏊",
  Athletics: "🏃",
  Cycling: "🚴",
};


/* ---------------- types ---------------- */

interface ThemesProps {
  onBack: () => void;
  onStartGame: () => void;
  isHost: boolean;
  canStartGame: boolean;
  inviteCode: string;
  hostUid: string;
}

/* ---------------- component ---------------- */

export default function Themes({
  onBack,
  onStartGame,
  isHost,
  canStartGame,
  inviteCode,
  hostUid,
}: ThemesProps) {
  const { selectedThemeId, setTheme } = useTheme();

  const themeCategories = useMemo(
    () => [
      { id: "nature", name: "Nature", items: ["Forest", "Mountains", "Beach", "Desert", "Jungle", "Arctic"] },
      { id: "animals", name: "Animals", items: ["Mammals", "Birds", "Reptiles", "Amphibians", "Fish", "Insects"] },
      { id: "food", name: "Food & Drink", items: ["Fruits", "Vegetables", "Desserts", "Beverages", "Snacks", "Meals"] },
      { id: "careers", name: "Careers", items: ["Doctor", "Engineer", "Teacher", "Artist", "Scientist", "Chef"] },
      { id: "technology", name: "Technology", items: ["Gadgets", "AI", "Programming", "Robotics", "Space Tech", "VR/AR"] },
      { id: "sports", name: "Sports", items: ["Soccer", "Basketball", "Tennis", "Swimming", "Athletics", "Cycling"] },
    ],
    []
  );

  const featuredThemes = useMemo(() => ["Animals", "Planets", "Movies", "Video Games", "Landscapes"], []);

  const isValidTheme = (t: string) => Array.isArray(WORD_DATA[t]);

  // ✅ “active category” (som i html-eksempelet)
  const [activeCategoryId, setActiveCategoryId] = useState<string>(themeCategories[0]?.id ?? "nature");

  // sørg for at activeCategory alltid finnes hvis categories endres
  useEffect(() => {
    if (!themeCategories.some((c) => c.id === activeCategoryId)) {
      setActiveCategoryId(themeCategories[0]?.id ?? "nature");
    }
  }, [activeCategoryId, themeCategories]);

  const activeCategory = themeCategories.find((c) => c.id === activeCategoryId);

  const handleSelectTheme = async (themeId: string) => {
    if (!isHost) return;
    if (!inviteCode || !hostUid) return;
    if (!isValidTheme(themeId)) return;

    setTheme(themeId);
    await setLobbyTheme(inviteCode, hostUid, themeId);
  };

  // glare stuff (samme som før, men litt enklere)
  const [glareStates, setGlareStates] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const ids = featuredThemes.map((_, i) => `featured-${i}`);
    let cancelled = false;

    const loop = () => {
      if (cancelled) return;
      const pick = ids[Math.floor(Math.random() * ids.length)];
      const delay = Math.random() * 8000 + 2000;

      setTimeout(() => {
        if (cancelled) return;
        setGlareStates((p) => ({ ...p, [pick]: true }));
        setTimeout(() => {
          if (cancelled) return;
          setGlareStates((p) => ({ ...p, [pick]: false }));
          loop();
        }, 900);
      }, delay);
    };

    loop();
    return () => {
      cancelled = true;
    };
  }, [featuredThemes]);

  return (
    <ThemesContainer>
      <BackButton onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to Lobby
      </BackButton>

      <GlowingBorder>
        <FeaturedThemes>
          <FeaturedTitle>Featured Themes</FeaturedTitle>
          <FeaturedThemesGrid>
            {featuredThemes
              .filter(isValidTheme)
              .slice(0, 4)
              .map((theme, index) => (
                <FeaturedThemeButton
                  key={theme}
                  $isSelected={selectedThemeId === theme}
                  onClick={() => handleSelectTheme(theme)}
                  disabled={!isHost}
                  title={!isHost ? "Only host can choose theme" : ""}
                >
                  <GlareEffect $show={glareStates[`featured-${index}`] || false} />
                  <CheckDot $isSelected={selectedThemeId === theme}>✓</CheckDot>
                  {theme}
                </FeaturedThemeButton>
              ))}
          </FeaturedThemesGrid>
        </FeaturedThemes>
      </GlowingBorder>

      {/* ✅ Category “nav” (som eksempelet ditt) */}
      <CategoryNav>
        {themeCategories.map((cat) => (
          <CategoryBtn
            key={cat.id}
            onClick={() => setActiveCategoryId(cat.id)}
            $active={cat.id === activeCategoryId}
          >
            {cat.name}
          </CategoryBtn>
        ))}
      </CategoryNav>

      {/* ✅ Options panel under (ikke dropdown) */}
      <OptionsPanel>
        <OptionsTitle>
          {activeCategory?.name ?? "Options"}
          <SmallHint>Pick one theme</SmallHint>
        </OptionsTitle>

        <OptionsGrid>
          {(activeCategory?.items ?? [])
            .filter(isValidTheme)
            .map((item) => {
              const selected = selectedThemeId === item;
              return (
                <OptionCard
                  key={item}
                  $selected={selected}
                  onClick={() => handleSelectTheme(item)}
                  disabled={!isHost}
                >
                  <ItemEmoji>{ITEM_EMOJIS[item] ?? "✨"}</ItemEmoji>
                  <OptionName>{item}</OptionName>
                  {selected && <SelectedBadge>✓</SelectedBadge>}
                </OptionCard>

              );
            })}
        </OptionsGrid>
      </OptionsPanel>

      <Footer>
        {!isHost ? (
          <WaitingText>Waiting for host to choose a theme...</WaitingText>
        ) : (
          <PlayButton onClick={onStartGame} disabled={!canStartGame} />
        )}
      </Footer>
    </ThemesContainer>
  );
}

/* ---------------- styles ---------------- */

const gradientFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const ThemesContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: #1e293b;
  border-radius: 0.7rem;
  box-shadow: 0 2px 20px 2px #737884;
  position: relative;
  padding-bottom: 6rem;
`;

const BackButton = styled.button`
position: absolute;
top: -150px;
left: -40px;
  background: #374151;
  color: #e5e7eb;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  transition: background-color 0.2s;

  &:hover {
    background: #4b5563;
  }
`;

const ThemesHeader = styled.h2`
  color: #d1d5db;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const GlowingBorder = styled.div`
  position: relative;
  padding: 2px;
  border-radius: 0.75rem;
  background: linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b);
  background-size: 300% 300%;
  animation: ${gradientFlow} 8s ease infinite;
  max-width: 1240px;
  margin: 1.25rem auto;
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
`;

const FeaturedThemes = styled.div`
  display: flex;
  flex-direction: column;
  background: #2d3748;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  align-items: center;
  text-align: center;
  width: 100%;
`;

const FeaturedTitle = styled.h3`
  color: #e2e8f0;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;

  &::before,
  &::after {
    content: "★";
    color: #f6e05e;
  }
`;

const FeaturedThemesGrid = styled.div`
  width: 100%;
  max-width: 860px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 0.75rem;
`;

const FeaturedThemeButton = styled.button<{ $isSelected: boolean }>`
  position: relative;
  overflow: hidden;
  border: none;
  border-radius: 14px;
  padding: 0.75rem 0.9rem;
  cursor: pointer;
  color: ${({ $isSelected }) => ($isSelected ? "#fff" : "#e5e7eb")};
  background: ${({ $isSelected }) => ($isSelected ? "rgba(59,130,246,0.85)" : "rgba(31,41,55,0.7)")};
  transition: transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease;
  text-align: left;
  font-weight: 700;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(59, 130, 246, 0.18);
    background: ${({ $isSelected }) => ($isSelected ? "#2563eb" : "#374151")};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const GlareEffect = styled.span<{ $show: boolean }>`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 200, 221, 0.25) 25%,
    rgba(255, 200, 221, 0.3) 45%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: translateX(${({ $show }) => ($show ? "200%" : "-100%")});
  transition: transform 0.8s ease;
  pointer-events: none;
`;

const CheckDot = styled.span<{ $isSelected: boolean }>`
  display: inline-grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  margin-right: 8px;
  background: ${({ $isSelected }) => ($isSelected ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)")};
  font-size: 12px;
  font-weight: 900;
`;

const CategoryNav = styled.div`
  margin-top: 1.25rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
`;

const CategoryBtn = styled.button<{ $active: boolean }>`
  border: none;
  border-radius: 12px;
  padding: 0.7rem 1rem;
  cursor: pointer;
  font-weight: 800;
  letter-spacing: 0.2px;

  background: ${({ $active }) => ($active ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#374151")};
  color: ${({ $active }) => ($active ? "#fff" : "#e5e7eb")};
  box-shadow: ${({ $active }) => ($active ? "0 10px 24px rgba(102,126,234,0.25)" : "none")};

  &:hover {
    opacity: 0.95;
    transform: translateY(-1px);
  }
`;

const OptionsPanel = styled.div`
  margin-top: 1.25rem;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.25rem;
  animation: fadeIn 0.25s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const OptionsTitle = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  color: #e2e8f0;
  font-weight: 900;
  margin-bottom: 0.75rem;
`;

const SmallHint = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: #94a3b8;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
`;

const OptionCard = styled.button<{ $selected: boolean }>`
  position: relative;
  border-radius: 14px;
  padding: 1rem;
  border: 2px solid ${({ $selected }) => ($selected ? "transparent" : "rgba(255,255,255,0.08)")};
  background: ${({ $selected }) => ($selected ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "rgba(30,41,59,0.45)")};
  color: ${({ $selected }) => ($selected ? "#fff" : "#e5e7eb")};
  cursor: pointer;
  text-align: left;
  transition: transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 16px 28px rgba(0, 0, 0, 0.28);
    border-color: ${({ $selected }) => ($selected ? "transparent" : "rgba(102,126,234,0.45)")};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;
const ItemEmoji = styled.div`
  font-size: 1.5rem;
  line-height: 1;
`;

const OptionName = styled.div`
  font-weight: 900;
  font-size: 1rem;
`;

const SelectedBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.25);
  font-weight: 900;
  font-size: 12px;
`;

const Footer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 1rem;
  background: rgba(31, 41, 55, 0.95);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 0 0 0.7rem 0.7rem;
`;

const WaitingText = styled.div`
  color: #94a3b8;
  font-style: italic;
  font-size: 0.9rem;
`;

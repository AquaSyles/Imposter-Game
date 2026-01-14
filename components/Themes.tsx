"use client";

import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTheme } from "./ThemeContext";
import PlayButton from "./PlayButton";

/* ---------------- DATA: ORDBANK (Lagt til for å fikse build error) ---------------- */
// Denne må eksporteres slik at page.tsx finner den.
// Nøklene her matcher knappene i designet under (f.eks. "Forest", "Pizza", "Planets").

export const WORD_DATA: Record<string, string[]> = {
  // --- Nature ---
  Forest: ["Tree", "Bear", "Mushroom", "Cabin", "Path", "Wolf", "Owl", "Campfire"],
  Mountains: ["Snow", "Climbing", "Goat", "Peak", "Skiing", "Yeti", "Cave", "Echo"],
  Beach: ["Sand", "Ocean", "Sun", "Crab", "Towel", "Surfing", "Shell", "Shark"],
  Desert: ["Cactus", "Camel", "Sand", "Scorpion", "Oasis", "Pyramid", "Heat", "Lizard"],
  Jungle: ["Tiger", "Vine", "Monkey", "Rain", "Snake", "Parrot", "Waterfall", "Jaguar"],
  Arctic: ["Penguin", "Ice", "Polar Bear", "Snow", "Igloo", "Seal", "Cold", "Glacier"],

  // --- Animals (Categories & Featured) ---
  Animals: ["Lion", "Elephant", "Giraffe", "Zebra", "Monkey", "Tiger", "Kangaroo", "Panda"],
  Mammals: ["Lion", "Dog", "Cat", "Human", "Whale", "Bat", "Horse", "Mouse"],
  Birds: ["Eagle", "Penguin", "Parrot", "Owl", "Duck", "Chicken", "Peacock", "Swan"],
  Reptiles: ["Snake", "Lizard", "Turtle", "Crocodile", "Chameleon", "Gecko", "Iguana", "Cobra"],
  Amphibians: ["Frog", "Toad", "Salamander", "Newt", "Tadpole", "Axolotl"],
  Fish: ["Shark", "Goldfish", "Salmon", "Tuna", "Clownfish", "Piranha", "Eel", "Stingray"],
  Insects: ["Ant", "Bee", "Butterfly", "Spider", "Mosquito", "Beetle", "Fly", "Worm"],

  // --- Food ---
  Fruits: ["Apple", "Banana", "Orange", "Grape", "Strawberry", "Watermelon", "Lemon", "Cherry"],
  Vegetables: ["Carrot", "Potato", "Broccoli", "Corn", "Onion", "Tomato", "Spinach", "Pepper"],
  Desserts: ["Cake", "Ice Cream", "Chocolate", "Cookie", "Donut", "Pie", "Brownie", "Pudding"],
  Beverages: ["Water", "Coffee", "Tea", "Soda", "Juice", "Milk", "Beer", "Wine"],
  Snacks: ["Chips", "Popcorn", "Nuts", "Pretzel", "Candy", "Cracker", "Cheese", "Jerky"],
  Meals: ["Pizza", "Burger", "Pasta", "Sushi", "Steak", "Taco", "Soup", "Salad"],

  // --- Careers ---
  Doctor: ["Hospital", "Stethoscope", "Medicine", "Nurse", "Surgery", "Patient", "White Coat"],
  Engineer: ["Blueprint", "Bridge", "Math", "Helmet", "Computer", "Build", "Machine"],
  Teacher: ["School", "Chalkboard", "Student", "Book", "Homework", "Classroom", "Apple"],
  Artist: ["Paint", "Brush", "Canvas", "Color", "Gallery", "Sculpture", "Sketch"],
  Scientist: ["Lab", "Experiment", "Chemical", "Microscope", "Coat", "Discovery", "Formula"],
  Chef: ["Kitchen", "Knife", "Hat", "Cooking", "Restaurant", "Recipe", "Oven", "Taste"],

  // --- Technology ---
  Gadgets: ["Phone", "Watch", "Tablet", "Camera", "Headphones", "Drone", "Laptop"],
  AI: ["Robot", "Code", "Future", "Smart", "Computer", "Data", "Brain"],
  Programming: ["Code", "Bug", "Laptop", "Coffee", "Keyboard", "Screen", "Developer"],
  Robotics: ["Metal", "Battery", "Wire", "Motor", "Sensor", "Cyborg", "Factory"],
  "Space Tech": ["Rocket", "Satellite", "Rover", "Station", "Telescope", "Suit", "Launch"],
  "VR/AR": ["Goggles", "Virtual", "Game", "3D", "Headset", "Reality", "Motion"],

  // --- Sports ---
  Soccer: ["Ball", "Goal", "Grass", "Referee", "Team", "Kick", "World Cup"],
  Basketball: ["Hoop", "Court", "Dunk", "Net", "Jersey", "NBA", "Dribble"],
  Tennis: ["Racket", "Net", "Ball", "Court", "Serve", "Wimbledon", "Love"],
  Swimming: ["Pool", "Water", "Goggles", "Race", "Dive", "Swimsuit", "Stroke"],
  Athletics: ["Run", "Jump", "Track", "Gold", "Sprint", "Hurdle", "Relay"],
  Cycling: ["Bike", "Helmet", "Road", "Tour", "Wheel", "Pedal", "Race"],

  // --- Featured / Misc ---
  Planets: ["Mars", "Venus", "Jupiter", "Saturn", "Earth", "Neptune", "Mercury", "Uranus"],
  Movies: ["Popcorn", "Cinema", "Actor", "Screen", "Ticket", "Hollywood", "Director", "Oscar"],
  "Video Games": ["Controller", "Console", "Level", "Boss", "Score", "Player", "Online"],
  Landscapes: ["Mountain", "River", "Valley", "Ocean", "Desert", "Forest", "City"],
};

/* ---------------- Styled Components ---------------- */

const gradientFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const GlowingBorder = styled.div`
  position: relative;
  padding: 2px;
  border-radius: 0.75rem;
  background: linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b);
  background-size: 300% 300%;
  animation: ${gradientFlow} 8s ease infinite;
  max-width: 1240px;
  margin: 2rem auto;
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
`;

const BackButton = styled.button`
  background: #374151;
  color: #e5e7eb;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  transition: background-color 0.2s;
   
  &:hover {
    background: #4b5563;
  }
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
  z-index: 1;
  padding-bottom: 6rem;
`;

const ThemesHeader = styled.h2`
  color: #d1d5db;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
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
  font-size: 1.25rem;
  margin-bottom: 1rem;
  margin-right: auto;
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '★';
    color: #f6e05e;
  }
  &:after {
    content: '★';
    color: #f6e05e;
  }
`;

const FeaturedThemesGrid = styled.div`
  display: grid;
  justify-content: center;
  align-items: center;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.75rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    max-width: 100%;
  }
`;

const CategoriesRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
   
  @media (max-width: 768px) {
    gap: 0.75rem;
  }
   
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const CategoryCard = styled.div<{ $isExpanded: boolean }>`
  border-radius: 0.5rem;
  overflow-x: visible;
  background-color: ${({ $isExpanded }) => $isExpanded ? '#1f2937' : 'transparent'};
  box-shadow: ${({ $isExpanded }) => $isExpanded ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'};
  position: relative;
  z-index: ${({ $isExpanded }) => $isExpanded ? '10' : '1'};
  flex: 1 1 200px;
  min-width: 0;
   
  @media (max-width: 768px) {
    flex: 1 1 calc(50% - 0.5rem);
  }
   
  @media (max-width: 480px) {
    flex: 1 1 100%;
  }
`;

const CategoryHeader = styled.button<{ $isExpanded: boolean }>`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: #374151;
  color: #e5e7eb;
  border: none;
  border-radius: ${({ $isExpanded }) => $isExpanded ? '0.5rem 0.5rem 0 0' : '0.5rem 0.5rem 0.5rem 0.5rem'};
  cursor: pointer;
  transition: background-color 0.2s;
  font-weight: 500;

  &:hover {
    background-color: #4b5563;
  }
`;

const CategoryContent = styled.div`
  top: 100%;
  left: 0;
  right: 0;
  padding: 0.75rem;
  background-color: #1f2937;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-top: none;
  border-radius: 0 0 0.5rem 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

const GlareEffect = styled.span<{ $show: boolean; $delay: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 200, 221, 0.3) 20%,
    rgba(255, 200, 221, 0.4) 40%,
    rgba(255, 200, 221, 0.2) 60%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: translateX(-100%);
  transition: transform 0.7s ease-out;
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  transition: ${({ $show }) =>
    $show
      ? 'opacity 0.3s ease, transform 0.7s ease-out;'
      : 'opacity 0.5s ease 0.2s, transform 0s 0.7s;'};
  ${({ $show }) => $show && 'transform: translateX(200%);'}
  ${({ $delay }) => `animation-delay: ${$delay}ms;`}
  pointer-events: none;
`;

const ThemeButton = styled.button<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  text-align: left;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.25rem;
  border-radius: 0.375rem;
  border: none;
  background: ${({ $isSelected }) => $isSelected ? 'rgba(59, 130, 246, 0.8)' : 'rgba(31, 41, 55, 0.7)'};
  color: ${({ $isSelected }) => $isSelected ? 'white' : '#e5e7eb'};
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  &:hover {
    background: ${({ $isSelected }) => $isSelected ? '#2563eb' : '#374151'};
  }

  position: relative;
  overflow: hidden;
`;

const Checkbox = styled.span<{ $isSelected: boolean }>`
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
  border: 1px solid ${({ $isSelected }) => $isSelected ? '#3b82f6' : '#6b7280'};
  background: ${({ $isSelected }) => $isSelected ? '#3b82f6' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 0.75rem;
    height: 0.75rem;
    color: white;
    opacity: ${({ $isSelected }) => $isSelected ? 1 : 0};
    transition: opacity 0.2s;
  }
`;

const Footer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 1rem;
  background: rgba(31, 41, 55, 0.95);
  border-top: 1px solid rgba(255,255,255,0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 0 0 0.7rem 0.7rem;
`;

const WaitingText = styled.div`
  color: #94a3b8;
  font-style: italic;
  font-size: 0.9rem;
  animation: pulse 2s infinite;
  @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
`;

/* ---------------- Component ---------------- */

interface ThemesProps {
  onBack: () => void;
  onStartGame: () => void;
  isHost: boolean;
  canStartGame: boolean;
}

export default function Themes({ onBack, onStartGame, isHost, canStartGame }: ThemesProps) {
  // ✅ Henter selectedThemes fra context slik at page.tsx får tilgang til valgene
  const { selectedThemes, toggleTheme: toggleCtxTheme } = useTheme();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Definerer kategoriene for UI-et
  const themeCategories = [
    {
      id: 'nature',
      name: 'Nature',
      items: ['Forest', 'Mountains', 'Beach', 'Desert', 'Jungle', 'Arctic']
    },
    {
      id: 'animals',
      name: 'Animals',
      items: ['Mammals', 'Birds', 'Reptiles', 'Amphibians', 'Fish', 'Insects']
    },
    {
      id: 'food',
      name: 'Food & Drink',
      items: ['Fruits', 'Vegetables', 'Desserts', 'Beverages', 'Snacks', 'Meals']
    },
    {
      id: 'careers',
      name: 'Careers',
      items: ['Doctor', 'Engineer', 'Teacher', 'Artist', 'Scientist', 'Chef']
    },
    {
      id: 'technology',
      name: 'Technology',
      items: ['Gadgets', 'AI', 'Programming', 'Robotics', 'Space Tech', 'VR/AR']
    },
    {
      id: 'sports',
      name: 'Sports',
      items: ['Soccer', 'Basketball', 'Tennis', 'Swimming', 'Athletics', 'Cycling']
    },
  ];

  const featuredThemes = [
    'Animals',
    'Planets',
    'Movies',
    'Video Games',
    'Landscapes'
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        setExpandedCategories(new Set([categoryId]));
      }
      return newSet;
    });
  };

  const [glareStates, setGlareStates] = useState<Record<string, boolean>>({});
  const [delays, setDelays] = useState<number[]>([]);

  useEffect(() => {
    const featuredThemeIds = featuredThemes.map((_, index) => `featured-${index}`);
    const startRandomGlare = () => {
      const randomThemeId = featuredThemeIds[Math.floor(Math.random() * featuredThemeIds.length)];
      const delay = Math.random() * 8000 + 2000;
      setTimeout(() => {
        setGlareStates(prev => ({ ...prev, [randomThemeId]: !prev[randomThemeId] }));
        setTimeout(() => {
          setGlareStates(prev => ({ ...prev, [randomThemeId]: !prev[randomThemeId] }));
        }, 1000);
        startRandomGlare();
      }, delay);
    };
    startRandomGlare();
    return () => {};
  }, []);

  useEffect(() => {
    setDelays(Array(4).fill(0).map(() => Math.random() * 1000));
  }, []);

  const handleToggle = (theme: string) => {
    if(!isHost) return;
    toggleCtxTheme(theme);
  };

  return (
    <>
      <ThemesContainer>
        <BackButton onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Lobby
        </BackButton>
        <ThemesHeader>Game Themes</ThemesHeader>
        <GlowingBorder>
          <FeaturedThemes>
            <FeaturedTitle>Featured Themes</FeaturedTitle>
            <FeaturedThemesGrid>
              {featuredThemes.slice(0, 4).map((theme, index) => (
                <ThemeButton
                  key={theme}
                  $isSelected={selectedThemes.has(theme)}
                  onClick={() => handleToggle(theme)}
                  style={{ opacity: isHost ? 1 : 0.7, cursor: isHost ? 'pointer' : 'default' }}
                >
                  <GlareEffect 
                    $show={glareStates[`featured-${index}`] || false}
                    $delay={delays[index] || 0}
                  />
                  <Checkbox $isSelected={selectedThemes.has(theme)}>
                    <svg viewBox="0 0 10 8" fill="none" stroke="currentColor">
                      <path d="M9 1L3.5 6.5L1 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Checkbox>
                  {theme}
                </ThemeButton>
              ))}
            </FeaturedThemesGrid>
          </FeaturedThemes>
        </GlowingBorder>
        <CategoriesRow>
          {themeCategories.map(category => {
            const isExpanded = expandedCategories.has(category.id);
            return (
              <CategoryCard key={category.id} $isExpanded={isExpanded}>
                <CategoryHeader onClick={() => toggleCategory(category.id)} $isExpanded={isExpanded}>
                  {category.name}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    style={{
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.2s'
                    }}
                  >
                    <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </CategoryHeader>

                {isExpanded && (
                  <CategoryContent>
                    {category.items.map(item => {
                      const isSelected = selectedThemes.has(item);
                      return (
                        <ThemeButton
                          key={item}
                          $isSelected={isSelected}
                          onClick={() => handleToggle(item)}
                          style={{ opacity: isHost ? 1 : 0.7, cursor: isHost ? 'pointer' : 'default' }}
                        >
                          <Checkbox $isSelected={isSelected}>
                            <svg viewBox="0 0 10 8" fill="none" stroke="currentColor">
                              <path d="M9 1L3.5 6.5L1 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </Checkbox>
                          {item}
                        </ThemeButton>
                      );
                    })}
                  </CategoryContent>
                )}
              </CategoryCard>
            );
          })}
        </CategoriesRow>

        <Footer>
            {!isHost ? (
                <WaitingText>Waiting for host to choose themes...</WaitingText>
            ) : (
                <PlayButton 
                    onClick={onStartGame} 
                    disabled={!canStartGame} 
                />
            )}
        </Footer>
      </ThemesContainer>
    </>
  );
}
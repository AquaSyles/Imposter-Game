"use client";
import { ReactEventHandler, useState } from "react";
import styled from "styled-components";

const CounterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 0.75rem;
  padding: 0.5rem 1rem;
  gap: 1rem;
`;

const CounterButton = styled.button`
  color: #3b82f6;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  width: 56px;
  height: 56px;

  &:hover {
    background-color: rgba(59, 130, 246, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: none;
  }

  svg {
    width: 44px;
    height: 44px;
  }
`;

const CounterInput = styled.input`
  color: white;
  font-size: 1.125rem;
  font-weight: 500;
  background-color: #27272a;
  border-radius: 100%;
  text-align: center;
  width: 60px;
  height: 60px;
  border: none;
  
  &:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type=number] {
    -moz-appearance: textfield;
  }
`;

// Resten av koden forblir den samme...
const Increment = (CurrentValue: any, SetValue: any, Max?: number) => {
    if (Max && CurrentValue >= Max) return;
    SetValue(Number(CurrentValue) + 1);
}

const Decrement = (CurrentValue: any, SetValue: any, Min?: number) => {
    if (Min && CurrentValue <= Min) return;
    SetValue(Number(CurrentValue) - 1);
}

const OnChange = (SetValue: any, e: React.ChangeEvent<HTMLInputElement>) => {
    SetValue(e.target.value);
}

const OnBlur = (SetValue: any, e: React.ChangeEvent<HTMLInputElement>, Min?: number, Max?: number) => {
    const value = e.target.value;
    const numValue = parseInt(value, 10);

    if (value === '' || isNaN(numValue)) {
        if (Min !== undefined) {
            e.target.value = Min.toString();
            SetValue(Min);
        }
        return;
    }

    if (Min !== undefined && numValue < Min) {
        e.target.value = Min.toString();
        SetValue(Min);
    } else if (Max !== undefined && numValue > Max) {
        e.target.value = Max.toString();
        SetValue(Max);
    } else {
        SetValue(numValue);
    }
}

const Counter = ({ DefaultValue, Name, Min, Max }: { 
    DefaultValue: number, 
    Name: string, 
    Min?: number, 
    Max?: number 
}) => {
    const [CurrentValue, SetValue] = useState<string | number>(DefaultValue || 0);

    return (
        <CounterContainer>
            <CounterButton 
                type="button" 
                onClick={() => Decrement(CurrentValue, SetValue, Min)}
                disabled={Min !== undefined && Number(CurrentValue) <= Min}
                aria-label="Decrease"
            >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 12L18 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
            </CounterButton>
            
            <CounterInput 
                type="number"
                min={Min} 
                max={Max} 
                value={CurrentValue} 
                onChange={(e) => OnChange(SetValue, e)} 
                onBlur={(e) => OnBlur(SetValue, e, Min, Max)}
                aria-label={Name}
            />
            
            <CounterButton 
                type="button" 
                onClick={() => Increment(CurrentValue, SetValue, Max)}
                disabled={Max !== undefined && Number(CurrentValue) >= Max}
                aria-label="Increase"
            >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 12H18M12 6V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
            </CounterButton>
            
            <input type="hidden" name={Name} value={CurrentValue} />
        </CounterContainer>
    );
}

export default Counter;
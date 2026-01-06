"use client";

import { useState, forwardRef } from "react";

const Increment = (CurrentValue: any, SetValue: any, Max?: number) => {
    if (Max !== undefined && CurrentValue === Max) return;
    SetValue(CurrentValue + 1);
}

const Decrement = (CurrentValue: any, SetValue: any, Min?: number) => {
    if (Min !== undefined && CurrentValue === Min) return;
    SetValue(CurrentValue - 1);
}

const OnChange = (SetValue: any, e: React.ChangeEvent<HTMLInputElement>) => {
    const ChangedValue = e.target.value
    if (!/^-?\d*(\.\d*)?$/.test(ChangedValue)) return; // Makes it so we can only write numbers as input, including "-"

    SetValue(e.target.value);
}

const OnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    e.preventDefault();
    e.currentTarget.blur();
};

const OnBlur = (SetValue: any, e: React.ChangeEvent<HTMLInputElement>, Min?: number, Max?: number) => {
    let ChangedValue: number = parseInt(e.target.value);

    if (Min && ChangedValue < Min) ChangedValue = Min;
    if (Max && ChangedValue > Max) ChangedValue = Max;

    SetValue(ChangedValue || Min);
}

type CounterProps = {
  DefaultValue: number;
  Name: string;
  Min?: number;
  Max?: number;
};

//{ DefaultValue, Name, Min, Max }: { DefaultValue: number, Name: string, Min?: number, Max?: number }
const Counter = forwardRef<HTMLInputElement, CounterProps>((props, ref) => {
    const [ CurrentValue, SetValue ] = useState(props.DefaultValue || 0);

    return (
        <div className="flex items-center justify-between bg-zinc-800 rounded-xl px-4 py-2">
            <button type="button" className="text-blue-500 text-xl" onClick={() => Decrement(CurrentValue, SetValue, props.Min)}>−</button>
            <input ref={ref} name={props.Name} className="text-white text-lg font-medium" min={props.Min} max={props.Max} value={CurrentValue} onKeyDown={ OnKeyDown } onChange={(e) => { OnChange(SetValue, e) }} onBlur={(e) => { OnBlur(SetValue, e, props.Min, props.Max) }} />
            <button type="button" className="text-blue-500 text-xl" onClick={() => Increment(CurrentValue, SetValue, props.Max)}>+</button>
        </div>
    );
});

export default Counter;
"use client";

import { useEffect, useState, SetStateAction } from "react";

const Increment = (CurrentValue: any, SetVisibleCount: any, SetValue: any, SoftMax?: number, HardMax?: number) => {
    CurrentValue = Number(CurrentValue);

    if (SoftMax !== undefined && CurrentValue === SoftMax) return;
    if (HardMax !== undefined && CurrentValue === HardMax) return;

    SetValue(String(CurrentValue + 1));
    SetVisibleCount(String(CurrentValue + 1));
}

const Decrement = (CurrentValue: any, SetVisibleCount: any, SetValue: any, SoftMin?: number, HardMin?: number) => {
    CurrentValue = Number(CurrentValue);

    if (SoftMin !== undefined && CurrentValue === SoftMin) return;
    if (HardMin !== undefined && CurrentValue === HardMin) return;

    SetValue(String(CurrentValue - 1));
    SetVisibleCount(String(CurrentValue - 1));
    console.log("Decrementing Value from: ", CurrentValue);
}

const OnChange = (SetVisibleCount: any, e: React.ChangeEvent<HTMLInputElement>) => {
    const ChangedValue = e.target.value
    if (!/^-?\d*(\.\d*)?$/.test(ChangedValue)) return; // Makes it so we can only write numbers as input, including "-"

    SetVisibleCount(ChangedValue);
}

const OnBlur = (SetVisibleCount: any, SetValue: any, e: React.ChangeEvent<HTMLInputElement>, SoftMin?: number, SoftMax?: number, HardMin?: number, HardMax?: number) => {
    let ChangedValue: number = parseInt(e.target.value);

    if (SoftMin && ChangedValue < SoftMin) ChangedValue = SoftMin;
    if (SoftMax && ChangedValue > SoftMax) ChangedValue = SoftMax;

    if (HardMin && ChangedValue < HardMin) ChangedValue = HardMin;
    if (HardMax && ChangedValue > HardMax) ChangedValue = HardMax;


    if (ChangedValue) {
        SetValue(String(ChangedValue));
        SetVisibleCount(String(ChangedValue));
    } else {
        SetValue(String(HardMin || 0));
        SetVisibleCount(String(HardMin || 0));
    }
}

const OnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    e.preventDefault();
    e.currentTarget.blur();
};

type CounterProps = {
    Count: string;
    SetCount: React.Dispatch<SetStateAction<string>>;
    Name?: string;
    SoftMin?: number;
    SoftMax?: number;
    HardMin?: number;
    HardMax?: number;
};

const Counter = (props: CounterProps) => {
    const [VisibleCount, SetVisibleCount] = useState<string>(props.Count);

    // Keep track if this is the first render
    const [isFirstRender, setIsFirstRender] = useState(true);

    useEffect(() => {
        if (isFirstRender) {
            // Don't change anything on first render
            setIsFirstRender(false);
            return;
        }

        // After first render, clamp visible count if props.Count changes
        let count = Number(props.Count);

        // Reset back to Soft limits
        if (props.SoftMin !== undefined && count < props.SoftMin) count = props.SoftMin;
        if (props.SoftMax !== undefined && count > props.SoftMax) count = props.SoftMax;

        // Reset back to Hard limits, overwriting Soft limits
        if (props.HardMin !== undefined && count < props.HardMin) count = props.HardMin;
        if (props.HardMax !== undefined && count > props.HardMax) count = props.HardMax;

        SetVisibleCount(String(count));
    }, [props.Count, props.SoftMin, props.SoftMax, props.HardMin, props.HardMax]);

    return (
        <div className="flex items-center justify-between bg-zinc-800 rounded-xl px-4 py-2">
            <button type="button" className="text-blue-500 text-xl" onClick={() => Decrement(props.Count, SetVisibleCount, props.SetCount, props.SoftMin, props.HardMin)}>−</button>
            <input className="text-white text-lg font-medium" value={VisibleCount} onKeyDown={OnKeyDown} onChange={(e) => { OnChange(SetVisibleCount, e) }} onBlur={(e) => { OnBlur(SetVisibleCount, props.SetCount, e, props.SoftMin, props.SoftMax, props.HardMin, props.HardMax) }} />
            <input hidden={true} readOnly={true} name={props.Name} min={props.SoftMin} max={props.SoftMax} value={props.Count} />
            <button type="button" className="text-blue-500 text-xl" onClick={() => Increment(props.Count, SetVisibleCount, props.SetCount, props.SoftMax, props.HardMax)}>+</button>
        </div>
    );
};

export default Counter;
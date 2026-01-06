"use client";

import Image from "next/image";

import React, { useRef } from "react";
import PlayButton from "@/components/PlayButton";
import Counter from "@/components/Counter";


export default function Home() {
  const PlayersRef = useRef<HTMLInputElement | null>(null);
  const ImpostersRef = useRef<HTMLInputElement | null>(null);
  // Going to just use useState instead and use them in the components as a prop

  const HandleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const numPlayers = formData.get("numPlayers");
    console.log(PlayersRef.current?.value);
    console.log(ImpostersRef.current?.value);
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-black to-zinc-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md md:max-w-4xl">
        <form onSubmit={ HandleSubmit } className="bg-zinc-900/90 rounded-3xl shadow-2xl p-6 md:p-10">
          <h1 className="text-white text-3xl md:text-4xl font-semibold text-center mb-8">
            Imposter Game
          </h1>

          {/* Top controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Section title="Number of Players">
              <Counter ref={PlayersRef} DefaultValue={5} Name="numPlayers" Min={3} Max={20} />
            </Section>

            <Section title="Number of Imposters">
              <Counter ref={ImpostersRef} DefaultValue={1} Name="numImposters" Min={-2} Max={20} />
            </Section>
          </div>

          <Themes />

          <div className="flex justify-center">
            <PlayButton />
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string, children: any }) {
  return (
    <div>
      <div className="text-zinc-300 text-sm mb-2">{title}</div>
      {children}
    </div>
  );
}



function Themes() {
  const items = [
    "Objects",
    "Animals",
    "Food & Drink",
    "Roles",
    "Clothing",
    "Geography",
    "Plants",
    "Space",
  ];

  return (
    <div className="mb-8">
      <div className="text-zinc-300 text-sm mb-3 text-center">Themes</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((item) => (
          <button
            type="button"
            key={item}
            className="flex items-center gap-2 bg-zinc-800 rounded-xl px-3 py-2 text-zinc-200 text-sm"
          >
            <span className="w-4 h-4 rounded-full border border-zinc-500" />
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
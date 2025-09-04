"use client";

import React from "react";
import { motion } from "framer-motion";

const sampleLines = [
  "Dear Professor,",
  "I hope this finds you well.",
  "Unfortunately, I couldn't attend lecture today because",
  "I was feeling under the weather.",
  "I apologize for the inconvenience.",
  "Thank you for your understanding.",
  "Sincerely,",
  "A Dedicated Student",
  "Please accept my apologies",
  "I will catch up with the notes",
  "Looking forward to the next class",
];

function StaticLine({
  text,
  y,
  x,
  scale,
  opacity,
  rotate,
}: {
  text: string;
  y: string;
  x: string;
  scale: number;
  opacity: number;
  rotate: number;
}) {
  return (
    <div
      className="absolute whitespace-normal select-none pointer-events-none max-w-[30vw] sm:max-w-[28vw] md:max-w-[22vw]"
      style={{
        top: y,
        left: x,
        transform: `scale(${scale}) rotate(${rotate}deg)`,
        opacity,
      }}
    >
      <p
        style={{ fontFamily: "'Dancing Script', cursive", userSelect: "none" }}
        className="text-slate-400 sm:text-2xl md:text-4xl leading-relaxed tracking-wide drop-shadow"
      >
        {text}
      </p>
    </div>
  );
}

function FloatingNote({
  top,
  left,
  delay,
  children,
}: {
  top: string;
  left: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="absolute bg-yellow-400 text-black font-bold rounded-md shadow-lg px-6 py-3 max-w-xs pointer-events-none select-none"
      style={{ top, left, rotate: "-8deg", zIndex: 1 }}
      initial={{ y: 0, rotate: -6 }}
      animate={{ y: [0, 8, 0], rotate: [-6, 3, -6] }}
      transition={{
        repeat: Infinity,
        duration: 5,
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

export default function DynamicLetterLanding() {
  const positions = [
    { y: "7%", x: "5%" },
    { y: "13%", x: "38%" },
    { y: "17%", x: "70%" },
    { y: "25%", x: "15%" },
    { y: "32%", x: "50%" },
    { y: "40%", x: "78%" },
    { y: "50%", x: "10%" },
    { y: "57%", x: "55%" },
    { y: "65%", x: "30%" },
    { y: "72%", x: "70%" },
    { y: "80%", x: "18%" },
  ];

  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden select-none">
      {sampleLines.map((line, idx) => {
        const pos = positions[idx];
        const scale = 0.85 + (idx % 3) * 0.2;
        const opacity = 0.18 + (idx % 4) * 0.07;
        const rotate = (idx % 5) * 4 - 10;
        return (
          <StaticLine
            key={idx}
            text={line}
            y={pos.y}
            x={pos.x}
            scale={scale}
            opacity={opacity}
            rotate={rotate}
          />
        );
      })}


      <FloatingNote top="15%" left="5%" delay={0}>
        Missed class? <br /> No worries!
      </FloatingNote>
      <FloatingNote top="40%" left="12%" delay={2}>
        “My grandma’s sick” <br /> Not anymore ✨
      </FloatingNote>
      <FloatingNote top="65%" left="7%" delay={1.5}>
        Real excuses,<br /> freshly generated!
      </FloatingNote>
      <FloatingNote top="60%" left="78%" delay={3}>
        AI-powered magic , Your AI will do work for you by writing a letter and sending it to email 🎩
      </FloatingNote>
      <FloatingNote top="30%" left="72%" delay={4}>
        No more boring writing! Emails and letters
      </FloatingNote> <FloatingNote top="30%" left="72%" delay={4}>
       Generate the letter and send as a pdf to mentor&apos;s email
      </FloatingNote>

  
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-white text-5xl sm:text-6xl md:text-7xl font-serif drop-shadow-lg select-text break-words">
          Better <span className="text-yellow-400">Letter</span> AI
        </h1>
        <p className="text-yellow-300 font-handwriting text-4xl md:text-5xl italic drop-shadow-lg mt-6 max-w-xl mx-auto">
          Your AI-powered assistant for hassle-free letters.
        </p>
         <p className="text-yellow-300 font-handwriting text-4xl md:text-5xl italic drop-shadow-lg mt-6 max-w-xl mx-auto">
         just type the reason , generate the letter and send as a pdf to mentor&apos;s email, that&apos;s cool right
        </p>
        <div className="flex flex-wrap justify-center gap-8 mt-12 w-full max-w-md mx-auto">
          <a
            href="/sign-up"
            className="bg-yellow-400 text-black rounded-full px-14 py-4 text-xl font-bold shadow-lg hover:bg-yellow-300 transition flex-grow sm:flex-grow-0 sm:w-auto text-center"
          >
            Get Started
          </a>
          <a
            href="/sign-in"
            className="border border-yellow-400 text-yellow-400 rounded-full px-14 py-4 text-xl font-bold hover:bg-yellow-400 hover:text-black transition flex-grow sm:flex-grow-0 sm:w-auto text-center"
          >
            Login
          </a>
        </div>
        <p className="mt-20 text-yellow-200 opacity-70 font-mono text-xs select-none max-w-xs mx-auto">
          For best experience, view on desktop
        </p>
      </main>

  
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Dancing+Script&family=Great+Vibes&display=swap");
        .font-handwriting {
          font-family: "Great Vibes", cursive;
        }
      `}</style>
    </div>
  );
}

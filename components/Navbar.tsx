"use client";

import React, { Fragment } from "react";
import { useRouter } from "next/navigation";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDown, LogOut, Home } from "lucide-react";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";

export default function Navbar() {
  const router = useRouter();

  function handleLogout() {
    signOut();
  }
  const buttonTap = { scale: 0.95 };

  return (
    <nav className="flex flex-wrap items-center justify-between bg-black/90 backdrop-blur-md px-4 py-3 border-b border-gray-800 sticky top-0 z-50">
     
      <div className="flex items-center gap-4 flex-shrink-0">
        <h1
          onClick={() => router.push("/dashboard")}
          className="text-xl sm:text-2xl font-extrabold select-none tracking-tight bg-clip-text text-transparent 
                     bg-gradient-to-r from-gray-200 via-white to-gray-400 cursor-pointer"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && router.push("/dashboard")}
        >
          BetterLetterAI
        </h1>
      </div>

    
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mt-2 sm:mt-0">
        <motion.button
          onClick={handleLogout}
          aria-label="Logout"
          whileHover={{ scale: 1.05, backgroundColor: "#b91c1c", color: "#fff" }}
          whileTap={buttonTap}
          className="flex items-center gap-1.5 px-3 py-2 border border-red-700 rounded-md text-red-500 hover:shadow-[0_0_15px_rgba(255,0,0,0.4)] transition cursor-pointer"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </motion.button>
      </div>
    </nav>
  );
}

"use client";

import { useState } from "react";
import { Terminal, Shield, Menu, X } from "lucide-react";

export default function Navbar() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleWallet = () => {
    if (walletConnected) {
      setWalletConnected(false);
      setWalletAddress("");
    } else {
      setWalletConnected(true);
      // Generate a simulated mock address
      setWalletAddress("0x71C...3e9b");
    }
  };

  return (
    <header className="relative w-full border-b border-brand-border bg-brand-dark/80 backdrop-blur-md z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left Side: Status Label */}
          <div className="hidden md:flex items-center space-x-2 text-xs font-mono tracking-widest text-brand-red">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-red"></span>
            </span>
            <span>SYS_STATUS: ACTIVE</span>
          </div>

          {/* Center Area: Logo + Nav Links (stacked slightly or aligned) */}
          <div className="flex flex-1 items-center justify-center md:items-stretch md:justify-start lg:justify-center">
            <div className="flex flex-shrink-0 items-center">
              <span className="text-xl font-bold tracking-tighter text-white font-mono flex items-center">
                CLAW<span className="text-brand-red font-extrabold relative">X</span>
              </span>
            </div>
            
            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex ml-10 space-x-8 items-center">
              <a href="#markets" className="text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-brand-red transition-colors duration-200">
                Markets
              </a>
              <a href="#agents" className="text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-brand-red transition-colors duration-200">
                AI Agents
              </a>
              <a href="#docs" className="text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-brand-red transition-colors duration-200">
                Documentation
              </a>
              <a href="#quest" className="text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-brand-red transition-colors duration-200">
                GrowStreams Quest
              </a>
            </nav>
          </div>

          {/* Right Side: Pill-Shaped Wallet Button */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleWallet}
              className={`px-5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-300 ${
                walletConnected
                  ? "bg-brand-red text-white border border-brand-red hover:bg-transparent hover:text-brand-red"
                  : "bg-white text-black border border-white hover:bg-black hover:text-white"
              }`}
            >
              {walletConnected ? walletAddress : "CONNECT WALLET"}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-white lg:hidden focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-brand-border bg-brand-dark px-4 py-4 space-y-3">
          <a
            href="#markets"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-brand-red py-2"
          >
            Markets
          </a>
          <a
            href="#agents"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-brand-red py-2"
          >
            AI Agents
          </a>
          <a
            href="#docs"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-brand-red py-2"
          >
            Documentation
          </a>
          <a
            href="#quest"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-brand-red py-2"
          >
            GrowStreams Quest
          </a>
          <div className="md:hidden pt-2 border-t border-brand-border text-2xs font-mono tracking-widest text-brand-red flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-red"></span>
            </span>
            <span>SYS_STATUS: ACTIVE</span>
          </div>
        </div>
      )}
    </header>
  );
}

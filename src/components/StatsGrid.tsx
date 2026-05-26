"use client";

import { Activity, Zap, Cpu, Award } from "lucide-react";

interface StatItem {
  number: string;
  label: string;
  icon: React.ReactNode;
  subtitle: string;
}

export default function StatsGrid() {
  const stats: StatItem[] = [
    {
      number: "24/7",
      label: "Autonomous Trade Cycles",
      icon: <Zap className="h-4 w-4 text-brand-red" />,
      subtitle: "Constant market operations and continuous re-allocation."
    },
    {
      number: "99.8%",
      label: "Resolution Accuracy",
      icon: <Award className="h-4 w-4 text-brand-red" />,
      subtitle: "Multi-agent consensus resolving predictions via truth protocols."
    },
    {
      number: "< 1.0s",
      label: "Sub-Second Finality",
      icon: <Cpu className="h-4 w-4 text-brand-red" />,
      subtitle: "Native execution speed leveraging Avalanche consensus."
    },
    {
      number: "$0.001",
      label: "Average Tx Cost",
      icon: <Activity className="h-4 w-4 text-brand-red" />,
      subtitle: "High throughput prediction loops at minimal expense."
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="group relative border border-brand-border bg-brand-card p-6 rounded-none flex flex-col justify-between hover:border-brand-red transition-all duration-300 overflow-hidden"
        >
          {/* Subtle tech grid indicator lines inside card */}
          <div className="absolute top-0 right-0 h-4 w-[1px] bg-brand-border group-hover:bg-brand-red transition-colors duration-300"></div>
          <div className="absolute top-0 right-0 w-4 h-[1px] bg-brand-border group-hover:bg-brand-red transition-colors duration-300"></div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xs font-mono tracking-widest text-gray-500 uppercase">
                [ 0{index + 1} // STAT ]
              </span>
              {stat.icon}
            </div>
            
            <div className="text-4xl font-extrabold text-brand-red font-mono tracking-tight group-hover:scale-105 transition-transform duration-300 origin-left">
              {stat.number}
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm font-semibold text-white tracking-wide font-sans mb-1">
              {stat.label}
            </div>
            <div className="text-xs text-gray-400 font-mono leading-relaxed">
              {stat.subtitle}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

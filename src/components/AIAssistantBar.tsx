import React, { useState } from 'react';
import { Home, Send, Wand2, Lightbulb, Check } from 'lucide-react';
import { RoomConfig, AgeBracket, WallSide } from '../types/index.ts';

interface AIAssistantBarProps {
  roomConfig: RoomConfig;
  onApplyAILayout: (configuredRoom: RoomConfig) => void;
}

export const AIAssistantBar: React.FC<AIAssistantBarProps> = ({
  roomConfig,
  onApplyAILayout
}) => {
  const [promptText, setPromptText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const promptPresets = [
    {
      label: '🌱 Montessori Toddler Nursery',
      prompt: 'Montessori room for a 1.5-year-old with low floor bed, accessible open shelf and soft crawling mat.',
      config: {
        name: 'Montessori Toddler Discovery Room',
        childName: 'Oliver',
        ageBracket: '0-2' as AgeBracket,
        widthCm: 360,
        lengthCm: 420,
        doorWall: 'bottom' as WallSide,
        windowWall: 'top' as WallSide,
        colorScheme: 'warm_neutral' as const
      }
    },
    {
      label: '🎨 Preschool Craft & Pretend Play',
      prompt: 'Preschool room for 4-year-old with sensory craft table, reading teepee and dress-up cubbies.',
      config: {
        name: 'Preschool Active Craft & Pretend Studio',
        childName: 'Maya',
        ageBracket: '3-5' as AgeBracket,
        widthCm: 380,
        lengthCm: 440,
        doorWall: 'left' as WallSide,
        windowWall: 'top' as WallSide,
        colorScheme: 'earthy_sage' as const
      }
    },
    {
      label: '🧩 Primary Lego & Study Suite',
      prompt: 'Primary student room for 7-year-old with tilt study desk, Lego building zone and beanbag nook.',
      config: {
        name: 'Primary Focus & Lego Construction Suite',
        childName: 'Liam',
        ageBracket: '6-8' as AgeBracket,
        widthCm: 400,
        lengthCm: 460,
        doorWall: 'bottom' as WallSide,
        windowWall: 'right' as WallSide,
        colorScheme: 'calm_indigo' as const
      }
    },
    {
      label: '🎧 Tween Ergonomic Study & Lounge',
      prompt: 'Tween bedroom for 10-year-old with electric sit-stand desk, social beanbag lounge and vertical storage.',
      config: {
        name: 'Tween Studio & Creative Lounge',
        childName: 'Sophia',
        ageBracket: '9-12' as AgeBracket,
        widthCm: 420,
        lengthCm: 500,
        doorWall: 'left' as WallSide,
        windowWall: 'top' as WallSide,
        colorScheme: 'soft_terracotta' as const
      }
    }
  ];

  const handleApplyPreset = (preset: typeof promptPresets[0]) => {
    setIsProcessing(true);
    setPromptText(preset.prompt);
    
    setTimeout(() => {
      const updated: RoomConfig = {
        ...roomConfig,
        name: preset.config.name,
        childName: preset.config.childName,
        ageBracket: preset.config.ageBracket,
        widthCm: preset.config.widthCm,
        lengthCm: preset.config.lengthCm,
        doorWall: preset.config.doorWall,
        windowWall: preset.config.windowWall,
        colorScheme: preset.config.colorScheme
      };

      onApplyAILayout(updated);
      setIsProcessing(false);
      setSuccessMessage(`AI applied: ${preset.config.name}`);
      setTimeout(() => setSuccessMessage(null), 3500);
    }, 500);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    setIsProcessing(true);

    // Parse natural language intent
    const text = promptText.toLowerCase();
    let targetAge: AgeBracket = roomConfig.ageBracket;
    let targetScheme = roomConfig.colorScheme;
    let newWidth = roomConfig.widthCm;
    let newLength = roomConfig.lengthCm;

    if (text.includes('toddler') || text.includes('baby') || text.includes('1') || text.includes('2') || text.includes('infant')) {
      targetAge = '0-2';
      targetScheme = 'warm_neutral';
    } else if (text.includes('preschool') || text.includes('3') || text.includes('4') || text.includes('5') || text.includes('kindergarten')) {
      targetAge = '3-5';
      targetScheme = 'earthy_sage';
    } else if (text.includes('homework') || text.includes('lego') || text.includes('6') || text.includes('7') || text.includes('8') || text.includes('primary')) {
      targetAge = '6-8';
      targetScheme = 'calm_indigo';
      newWidth = Math.max(380, newWidth);
    } else if (text.includes('teen') || text.includes('tween') || text.includes('9') || text.includes('10') || text.includes('11') || text.includes('12')) {
      targetAge = '9-12';
      targetScheme = 'soft_terracotta';
      newWidth = Math.max(400, newWidth);
      newLength = Math.max(450, newLength);
    }

    setTimeout(() => {
      const updated: RoomConfig = {
        ...roomConfig,
        name: `Custom AI Layout (${targetAge} yrs)`,
        ageBracket: targetAge,
        widthCm: newWidth,
        lengthCm: newLength,
        colorScheme: targetScheme
      };

      onApplyAILayout(updated);
      setIsProcessing(false);
      setSuccessMessage(`Synthesized AI Layout for ${targetAge} yrs (${(newWidth/100).toFixed(1)}m × ${(newLength/100).toFixed(1)}m)`);
      setTimeout(() => setSuccessMessage(null), 3500);
    }, 600);
  };

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/30 space-y-3">
      {/* Input bar */}
      <form onSubmit={handleCustomSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Wand2 className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Ask AI Stylist: e.g. 'Montessori room for a 3-year-old with reading teepee and low storage'..."
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            className="w-full bg-slate-900/90 border border-indigo-500/40 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 shadow-inner"
          />
        </div>

        <button
          type="submit"
          disabled={isProcessing || !promptText.trim()}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all shrink-0"
        >
          {isProcessing ? (
            <span>Generating...</span>
          ) : (
            <>
              <Home className="w-3.5 h-3.5 text-amber-300" />
              <span>Prompt to Layout</span>
            </>
          )}
        </button>
      </form>

      {/* Success alert message */}
      {successMessage && (
        <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-950/50 border border-emerald-500/40 px-3 py-1.5 rounded-lg animate-in fade-in">
          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
        <span className="text-slate-400 text-[11px] font-semibold shrink-0 flex items-center gap-1">
          <Lightbulb className="w-3 h-3 text-amber-400" />
          <span>Try:</span>
        </span>
        {promptPresets.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleApplyPreset(preset)}
            className="px-3 py-1 rounded-lg bg-slate-850 hover:bg-indigo-950/60 border border-slate-700/80 hover:border-indigo-500/60 text-slate-300 hover:text-indigo-200 text-xs font-medium shrink-0 transition-all"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};

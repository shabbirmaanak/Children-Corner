import React, { useState } from 'react';
import { X, Check, UserCheck, Building2, MapPin, Users, Hash, Shield } from 'lucide-react';
import { RoomConfig } from '../types/index.ts';

interface FamilyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomConfig: RoomConfig;
  onSaveProfile: (updated: Partial<RoomConfig>) => void;
}

export const FamilyProfileModal: React.FC<FamilyProfileModalProps> = ({
  isOpen,
  onClose,
  roomConfig,
  onSaveProfile
}) => {
  const [childName, setChildName] = useState(roomConfig.childName || '');
  const [itsId, setItsId] = useState(roomConfig.itsId || '');
  const [mauze, setMauze] = useState(roomConfig.mauze || '');
  const [jamiat, setJamiat] = useState(roomConfig.jamiat || '');
  const [hofIts, setHofIts] = useState(roomConfig.hofIts || '');
  const [hofName, setHofName] = useState(roomConfig.hofName || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      childName: childName.trim(),
      itsId: itsId.trim(),
      mauze: mauze.trim(),
      jamiat: jamiat.trim(),
      hofIts: hofIts.trim(),
      hofName: hofName.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-2 ring-white/10">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">ITS52 & Family Registration</h3>
              <p className="text-xs text-slate-400">Enter Child & Head of Family (HOF) registration details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Child Information Section */}
          <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Child / Member Details</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Enter Name"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-amber-400" />
                  <span>ITS52 (Child ITS)</span>
                </label>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="8-digit ITS"
                  value={itsId}
                  onChange={(e) => setItsId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Mauze & Jamiat Section */}
          <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Mauze & Jamiat Jurisdiction</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-indigo-400" />
                  <span>Mauze</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Mauze"
                  value={mauze}
                  onChange={(e) => setMauze(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-indigo-400" />
                  <span>Jamiat</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Jamiat"
                  value={jamiat}
                  onChange={(e) => setJamiat(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Head of Family (HOF) Section */}
          <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Head of Family (HOF)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">HOF Name</label>
                <input
                  type="text"
                  placeholder="Enter HOF Name"
                  value={hofName}
                  onChange={(e) => setHofName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-amber-400" />
                  <span>HOF ITS</span>
                </label>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="8-digit HOF ITS"
                  value={hofIts}
                  onChange={(e) => setHofIts(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Details</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

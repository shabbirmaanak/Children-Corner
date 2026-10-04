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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-mint-500 via-azure-500 to-coral-500 text-white flex items-center justify-center shadow-lg shadow-coral-500/20 ring-2 ring-white/80">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 font-display">ITS52 & Family Registration</h3>
              <p className="text-xs text-stone-500">Enter Child & Head of Family (HOF) registration details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Child Information Section */}
          <div className="p-4 rounded-2xl bg-coral-50/60 border border-coral-200/80 space-y-3">
            <div className="text-xs font-bold text-coral-800 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-coral-600" />
              <span>Child / Member Details</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Enter Name"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-medium focus:outline-none focus:border-coral-500 placeholder:text-stone-400 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-coral-600" />
                  <span>ITS52 (Child ITS)</span>
                </label>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="8-digit ITS"
                  value={itsId}
                  onChange={(e) => setItsId(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-coral-700 font-mono font-bold focus:outline-none focus:border-coral-500 placeholder:text-stone-400 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Mauze & Jamiat Section */}
          <div className="p-4 rounded-2xl bg-sunshine-50/60 border border-sunshine-200/80 space-y-3">
            <div className="text-xs font-bold text-sunshine-900 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-sunshine-700" />
              <span>Mauze & Jamiat Jurisdiction</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-sunshine-700" />
                  <span>Mauze</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Mauze"
                  value={mauze}
                  onChange={(e) => setMauze(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-medium focus:outline-none focus:border-sunshine-500 placeholder:text-stone-400 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-sunshine-700" />
                  <span>Jamiat</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Jamiat"
                  value={jamiat}
                  onChange={(e) => setJamiat(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-medium focus:outline-none focus:border-sunshine-500 placeholder:text-stone-400 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Head of Family (HOF) Section */}
          <div className="p-4 rounded-2xl bg-mint-50/60 border border-mint-200/80 space-y-3">
            <div className="text-xs font-bold text-mint-900 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-mint-700" />
              <span>Head of Family (HOF)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">HOF Name</label>
                <input
                  type="text"
                  placeholder="Enter HOF Name"
                  value={hofName}
                  onChange={(e) => setHofName(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-medium focus:outline-none focus:border-mint-500 placeholder:text-stone-400 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-mint-700" />
                  <span>HOF ITS</span>
                </label>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="8-digit HOF ITS"
                  value={hofIts}
                  onChange={(e) => setHofIts(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-mint-800 font-mono font-bold focus:outline-none focus:border-mint-500 placeholder:text-stone-400 shadow-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-2xl bg-gradient-to-r from-coral-500 to-sunshine-500 hover:from-coral-600 hover:to-sunshine-600 text-white font-bold text-xs shadow-md shadow-coral-500/20 transition-all flex items-center gap-1.5"
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

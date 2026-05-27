import { create } from 'zustand';
import type { Patient, Handoff, Flag, User } from '@/types';

interface AppState {
  user: User | null;
  patients: Patient[];
  handoffs: Handoff[];
  flags: Flag[];
  currentWard: string;
  sidebarOpen: boolean;
  setUser: (user: User | null) => void;
  setPatients: (patients: Patient[]) => void;
  addPatient: (patient: Patient) => void;
  updatePatient: (id: string, data: Partial<Patient>) => void;
  setHandoffs: (handoffs: Handoff[]) => void;
  addHandoff: (handoff: Handoff) => void;
  setFlags: (flags: Flag[]) => void;
  addFlag: (flag: Flag) => void;
  resolveFlag: (id: string) => void;
  setCurrentWard: (ward: string) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  patients: [],
  handoffs: [],
  flags: [],
  currentWard: typeof window !== 'undefined' ? localStorage.getItem('handoffai-ward') || 'ICU' : 'ICU',
  sidebarOpen: true,

  setUser: (user) => set({ user }),

  setPatients: (patients) => set({ patients }),

  addPatient: (patient) => set((state) => ({ patients: [...state.patients, patient] })),

  updatePatient: (id, data) =>
    set((state) => ({
      patients: state.patients.map((p) => (p.id === id ? { ...p, ...data } : p)),
    })),

  setHandoffs: (handoffs) => set({ handoffs }),

  addHandoff: (handoff) => set((state) => ({ handoffs: [handoff, ...state.handoffs] })),

  setFlags: (flags) => set({ flags }),

  addFlag: (flag) => set((state) => ({ flags: [...state.flags, flag] })),

  resolveFlag: (id) =>
    set((state) => ({
      flags: state.flags.map((f) => (f.id === id ? { ...f, resolved: true, resolvedAt: new Date().toISOString() } : f)),
    })),

  setCurrentWard: (ward) => {
    if (typeof window !== 'undefined') localStorage.setItem('handoffai-ward', ward);
    set({ currentWard: ward });
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));

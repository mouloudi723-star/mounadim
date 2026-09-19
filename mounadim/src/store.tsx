import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Item = {
  id: string;
  title: string;
  done?: boolean;
  date?: string;
  time?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  amount?: number;
  progress?: number;
  body?: string;
  description?: string;
  location?: string;
  duration?: number;
  startDate?: string;
  endDate?: string;
  pinned?: boolean;
  days?: string[];
  streak?: number;
};

export type Pomodoro = {
  focusMinutes: number;
  breakMinutes: number;
  sessions: number;
  totalFocusMinutes: number;
};

export type Data = {
  tasks: Item[];
  appointments: Item[];
  expenses: Item[];
  habits: Item[];
  goals: Item[];
  notes: Item[];
  theme: 'light' | 'dark';
  language: 'ar' | 'fr';
  profile: string;
  onboardingComplete: boolean;
  organizedAreas: string[];
  pomodoro: Pomodoro;
};

const seed: Data = {
  tasks: [
    { id: 'task-1', title: 'مراجعة خطة المشروع', done: false, date: '2026-09-21', time: '09:00', category: 'عمل', priority: 'high' },
    { id: 'task-2', title: 'التمرين الصباحي', done: true, date: '2026-09-20', time: '07:00', category: 'شخصي', priority: 'medium' },
  ],
  appointments: [{ id: 'appointment-1', title: 'اجتماع الفريق', date: '2026-09-22', time: '14:00', duration: 60, location: 'قاعة الاجتماعات', description: 'مراجعة تقدم المشروع.' }],
  expenses: [{ id: 'expense-1', title: 'مشتريات المنزل', amount: 150, date: '2026-09-19', category: 'المنزل' }],
  habits: [{ id: 'habit-1', title: 'القراءة', done: true, progress: 80, streak: 5, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] }, { id: 'habit-2', title: 'التمرين', done: false, progress: 60, streak: 3, days: ['Mon', 'Wed', 'Fri'] }],
  goals: [{ id: 'goal-1', title: 'التعلم', progress: 70, startDate: '2026-09-01', endDate: '2026-10-15' }],
  notes: [{ id: 'note-1', title: 'أفكار المشروع', body: 'اكتب أفكارك هنا.', date: '2026-09-19', pinned: true }],
  theme: 'light', language: 'ar', profile: 'مستخدم مِنظَّم', onboardingComplete: false, organizedAreas: [],
  pomodoro: { focusMinutes: 25, breakMinutes: 5, sessions: 0, totalFocusMinutes: 0 },
};

const key = 'mounadim-data-v2';
const itemKeys = ['tasks', 'appointments', 'expenses', 'habits', 'goals', 'notes'] as const;
type Collection = typeof itemKeys[number];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function validItem(value: unknown): value is Item {
  return isObject(value) && typeof value.id === 'string' && typeof value.title === 'string';
}

function read(): Data {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return seed;
    const value: unknown = JSON.parse(raw);
    if (!isObject(value)) return seed;
    const next = { ...seed, ...value } as Data;
    for (const collection of itemKeys) {
      if (!Array.isArray(next[collection]) || !next[collection].every(validItem)) next[collection] = seed[collection];
    }
    if (!next.pomodoro || typeof next.pomodoro !== 'object') next.pomodoro = seed.pomodoro;
    return next;
  } catch {
    return seed;
  }
}

type ContextValue = Data & {
  add: (kind: Collection, item: Item) => void;
  update: (kind: Collection, id: string, item: Item) => void;
  remove: (kind: Collection, id: string) => void;
  setPrefs: (value: Partial<Data>) => void;
  setPomodoro: (value: Partial<Pomodoro>) => void;
  reset: () => void;
  exportData: () => void;
  importData: (text: string) => boolean;
};

const Context = createContext<ContextValue | null>(null);

export function Store({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(read);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(data));
    document.documentElement.dataset.theme = data.theme;
    document.documentElement.dir = data.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = data.language;
  }, [data]);

  const value = useMemo<ContextValue>(() => ({
    ...data,
    add: (kind, item) => setData((current) => ({ ...current, [kind]: [...current[kind], item] })),
    update: (kind, id, item) => setData((current) => ({ ...current, [kind]: current[kind].map((entry) => entry.id === id ? item : entry) })),
    remove: (kind, id) => setData((current) => ({ ...current, [kind]: current[kind].filter((entry) => entry.id !== id) })),
    setPrefs: (value) => setData((current) => ({ ...current, ...value })),
    setPomodoro: (value) => setData((current) => ({ ...current, pomodoro: { ...current.pomodoro, ...value } })),
    reset: () => setData({ ...seed, onboardingComplete: true }),
    exportData: () => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'mounadim-backup.json';
      anchor.click();
      URL.revokeObjectURL(url);
    },
    importData: (text) => {
      try {
        const value: unknown = JSON.parse(text);
        if (!isObject(value)) return false;
        for (const collection of itemKeys) {
          if (!Array.isArray(value[collection]) || !value[collection].every(validItem)) return false;
        }
        if (value.theme !== 'light' && value.theme !== 'dark') return false;
        if (value.language !== 'ar' && value.language !== 'fr') return false;
        if (typeof value.profile !== 'string') return false;
        if (!isObject(value.pomodoro) || typeof value.pomodoro.focusMinutes !== 'number' || typeof value.pomodoro.breakMinutes !== 'number') return false;
        setData((current) => ({ ...current, ...value } as Data));
        return true;
      } catch {
        return false;
      }
    },
  }), [data]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export const useStore = () => {
  const value = useContext(Context);
  if (!value) throw new Error('Store must be used inside Store provider');
  return value;
};

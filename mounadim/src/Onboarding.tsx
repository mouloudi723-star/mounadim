import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from './store';

const translations = {
  ar: { welcome: 'مرحبًا بك في مِنظَّم', subtitle: 'مساحتك البسيطة لتنظيم يومك بوضوح.', name: 'ما اسمك؟', namePlaceholder: 'اكتب اسمك', areas: 'ماذا تريد أن تنظّم؟', next: 'التالي', start: 'ابدأ الآن', intro: 'أضف مهامك ومواعيدك وتابع تقدمك من لوحة تحكم واحدة.', task: 'المهام', calendar: 'المواعيد', money: 'المصاريف', habits: 'العادات', goals: 'الأهداف' },
  fr: { welcome: 'Bienvenue sur Mounadim', subtitle: 'Votre espace simple pour organiser votre journée.', name: 'Comment vous appelez-vous ?', namePlaceholder: 'Votre nom', areas: 'Que souhaitez-vous organiser ?', next: 'Suivant', start: 'Commencer', intro: 'Ajoutez vos tâches et suivez vos progrès depuis un seul tableau de bord.', task: 'Tâches', calendar: 'Rendez-vous', money: 'Dépenses', habits: 'Habitudes', goals: 'Objectifs' },
} as const;

export default function Onboarding() {
  const store = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(store.profile === 'مستخدم مِنظَّم' ? '' : store.profile);
  const [areas, setAreas] = useState<string[]>(store.organizedAreas);
  const t = translations[store.language];
  const options = [[t.task, 'tasks'], [t.calendar, 'calendar'], [t.money, 'expenses'], [t.habits, 'habits'], [t.goals, 'goals']];

  if (store.onboardingComplete) return null;

  const finish = () => {
    store.setPrefs({ profile: name.trim() || (store.language === 'ar' ? 'مستخدم مِنظَّم' : 'Utilisateur Mounadim'), organizedAreas: areas, onboardingComplete: true });
    navigate('/workspace');
  };

  return <div className="onboarding-backdrop">
    <section className="onboarding-card" aria-modal="true">
      <div className="onboarding-brand"><span className="onboarding-mark"><Sparkles size={18} /></span><strong>مِنظَّم</strong><span className="onboarding-step">{step + 1} / 3</span></div>
      {step === 0 && <div className="onboarding-content"><div className="onboarding-art"><Sparkles size={42} /></div><h1>{t.welcome}</h1><p>{t.subtitle}</p><p className="onboarding-intro">{t.intro}</p><button className="btn primary" onClick={() => setStep(1)}>{t.next}<ArrowLeft size={17} /></button></div>}
      {step === 1 && <div className="onboarding-content"><h1>{t.name}</h1><p>{t.subtitle}</p><input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={t.namePlaceholder} /><button className="btn primary" onClick={() => setStep(2)} disabled={!name.trim()}>{t.next}<ArrowLeft size={17} /></button></div>}
      {step === 2 && <div className="onboarding-content"><h1>{t.areas}</h1><p>{t.intro}</p><div className="onboarding-options">{options.map(([label, value]) => <button key={value} className={areas.includes(value) ? 'selected' : ''} onClick={() => setAreas((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value])}><span>{areas.includes(value) ? <Check size={17} /> : null}</span>{label}</button>)}</div><button className="btn primary" onClick={finish}>{t.start}<ArrowRight size={17} /></button></div>}
    </section>
  </div>;
}

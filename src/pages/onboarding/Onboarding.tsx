import { useEffect, useState, useCallback, useMemo } from 'react';
import { Home, WifiOff, ShieldCheck, Globe, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';

export default function OnboardingScreen({ onComplete }: { onComplete?: () => void }) {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();

  const steps = useMemo(() => [
    {
      icon: <Globe className="text-orange-500 w-12 h-12 animate-pulse" />,
      title: t('onboardingTitle1'),
      description: t('onboardingDesc1')
    },
    {
      icon: <WifiOff className="text-blue-500 w-12 h-12" />,
      title: t('onboardingTitle2'),
      description: t('onboardingDesc2')
    },
    {
      icon: <ShieldCheck className="text-emerald-500 w-12 h-12" />,
      title: t('onboardingTitle3'),
      description: t('onboardingDesc3')
    }
  ], [t]);

  const handleGetStarted = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      localStorage.setItem('onboardingComplete', 'true');
      if (onComplete) {
        onComplete();
      } else {
        navigate('/home');
      }
    }, 600); // Matches the fade-out duration
  }, [navigate, onComplete]);

  // Auto-advance through onboarding slides every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // Automatically start exit fade once slides are done if user hasn't clicked
        handleGetStarted();
      }
    }, 3500);

    return () => clearInterval(timer);
  }, [currentStep, handleGetStarted, steps.length]);

  return (
    <div className={`fixed inset-0 bg-[#1E3A8A] flex flex-col justify-between p-8 z-50 transition-all duration-700 ease-in-out ${
      isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'
    }`}>
      
      {/* Top Section: App Branding */}
      <div className="flex flex-col items-center mt-12 animate-fadeIn">
        <div className="bg-white p-4 rounded-2xl shadow-xl text-[#1E3A8A] mb-4">
          <Home size={40} className="fill-[#1E3A8A]" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-widest text-center">
          {t('brand')} <span className="text-orange-400 block text-lg font-bold tracking-normal mt-1">{t('country')}</span>
        </h1>
      </div>

      {/* Middle Section: Carousel Content Card */}
      <div className="max-w-md w-full mx-auto bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center transform transition-all duration-500 min-h-[280px]">
        <div className="mb-4 p-3 bg-slate-50 rounded-full border border-slate-100">
          {steps[currentStep].icon}
        </div>
        
        <h2 className="text-xl font-bold text-slate-800 mb-2 transition-all duration-300">
          {steps[currentStep].title}
        </h2>
        
        <p className="text-sm text-slate-600 leading-relaxed transition-all duration-300">
          {steps[currentStep].description}
        </p>
      </div>

      {/* Bottom Section: Stepper Progress & Call to Action */}
      <div className="max-w-md w-full mx-auto flex flex-col items-center gap-6 mb-8">
        
        {/* Step Indicator Dots */}
        <div className="flex gap-2">
          {steps.map((_, index) => (
            <div 
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentStep === index ? 'w-8 bg-orange-400' : 'w-2 bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Skip / Get Started Action Button */}
        <button 
          onClick={handleGetStarted}
          className="w-full bg-[#F97316] hover:bg-orange-600 active:scale-[0.99] text-white text-sm font-bold py-4 px-6 rounded-xl shadow-lg shadow-orange-900/30 flex items-center justify-center gap-2 tracking-wider uppercase transition-all group"
        >
          {currentStep === steps.length - 1 ? t('enterDirectory') : t('skipExplore')}
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
}
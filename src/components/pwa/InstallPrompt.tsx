import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface InstallPromptProps {
  variant?: 'button' | 'banner' | 'topnav';
  className?: string;
}

export default function InstallPrompt({ variant = 'button', className = '' }: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if device is iOS
    const ua = window.navigator.userAgent;
    const isAppleMobile = /iPhone|iPad|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isAppleMobile);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
          setCanInstall(false);
        }
      } catch (err) {
        console.error('Installation prompt failed:', err);
      } finally {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  // If already installed or dismissed, do not render
  if (isInstalled || (!canInstall && !isIOS)) {
    return null;
  }

  if (variant === 'topnav') {
    return (
      <button
        onClick={handleInstallClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 bg-canvas border border-hairline hover:border-hairline-strong rounded-sm text-xs font-semibold text-ink hover:bg-canvas-soft-2 transition-all cursor-pointer h-8 shadow-level-1 ${className}`}
        title="Install AI Study Notebook app"
      >
        <Download size={14} className="text-link" />
        <span className="hidden xs:inline">Install App</span>
      </button>
    );
  }

  if (variant === 'banner' && !isDismissed) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 max-w-sm w-[calc(100vw-2rem)] bg-canvas border border-hairline rounded-lg p-4 shadow-level-4 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary text-on-primary rounded-md flex items-center justify-center font-bold font-mono text-sm shrink-0">
            N
          </div>
          <div>
            <h4 className="text-xs font-bold text-ink tracking-tight font-sans">Install AI Study Notebook</h4>
            <p className="text-[11px] text-body font-sans">Fast access & full offline capability</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 bg-primary text-on-primary rounded-full text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1 shadow-level-2"
          >
            <Download size={12} />
            Install
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-mute hover:text-ink rounded-full transition-colors cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleInstallClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-on-primary hover:opacity-90 transition-opacity rounded-sm font-semibold text-xs shadow-level-2 cursor-pointer ${className}`}
    >
      <Download size={14} />
      <span>Install App</span>
    </button>
  );
}

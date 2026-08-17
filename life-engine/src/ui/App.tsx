import { useEffect, useState } from 'react';
import './theme.css';
import { useGame } from '../state/store';
import { StageCanvas } from './StageCanvas';
import { PreLifePanel, LiveHud, Reckoning } from './panels';
import { LiveFeed, HistoryStrip, FairnessPanel, SettingsMenu } from './side';
import { t, formatCurrency } from './i18n';
import { sound } from '../audio/sound';

export function App() {
  const g = useGame();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    g.init();
    const unlock = () => sound.unlock();
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    sound.setMuted(g.settings.muted);
  }, [g.settings.muted]);

  useEffect(() => {
    document.documentElement.classList.toggle('reduced-motion', g.settings.reducedMotion);
  }, [g.settings.reducedMotion]);

  const cfg = g.config;

  return (
    <div className="app">
      <StageCanvas skinId={g.skinId} />

      <div className="overlay">
        <header className="topbar">
          <div className="brand">
            <h1>{t('app.title')}</h1>
            <small>{t('app.tagline')}</small>
          </div>
          <div className="topbar-right">
            {cfg && (
              <div className="balance-chip">
                <span>{t('bet.balance')}</span>
                <b>{formatCurrency(g.balance, cfg.currency, cfg.locale)}</b>
              </div>
            )}
            <button className="icon-btn" aria-pressed={!g.settings.muted} aria-label={t('settings.sound')} onClick={() => g.toggleMuted()}>
              {g.settings.muted ? '🔇' : '🔊'}
            </button>
            <button className="icon-btn" aria-label="panels" onClick={() => setSideOpen((v) => !v)}>☰</button>
            <button className="icon-btn" aria-label="settings" onClick={() => setSettingsOpen(true)}>⚙</button>
          </div>
        </header>

        <div className="spacer" />

        {g.status === 'living' ? <LiveHud /> : g.status === 'idle' ? <PreLifePanel /> : null}

        <aside className={`side ${sideOpen ? 'open' : ''}`} aria-label="social and fairness">
          <div className="side-scroll">
            <HistoryStrip />
            <LiveFeed />
            <FairnessPanel />
          </div>
        </aside>
      </div>

      {g.status === 'reckoning' && <Reckoning />}
      <SettingsMenu open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

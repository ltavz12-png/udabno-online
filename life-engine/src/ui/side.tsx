import { useState } from 'react';
import { useGame } from '../state/store';
import { t, formatMultiplier } from './i18n';
import { verifyRound } from '../../engine/verify';
import type { FeedKind } from '../state/social';

const KIND_COLOR: Record<FeedKind, string> = {
  birth: '#9fd0ff',
  rest: '#7fe0a6',
  fulfil: '#ffce7a',
  death: '#ff7a7a',
  legacy: '#ffe08a',
  system: '#b6abd6',
  you: '#ffffff',
};

export function LiveFeed() {
  const feed = useGame((s) => s.feed);
  return (
    <div className="panel">
      <h2>{t('feed.title')}</h2>
      <div className="feed-list" role="log" aria-live="polite" aria-label={t('feed.title')}>
        {feed.map((f) => (
          <div className="feed-item" key={f.id}>
            <span className="dot" style={{ background: KIND_COLOR[f.kind] }} />
            <span className="who">{f.name}</span>
            <span className="what">{f.text}</span>
            {f.multiplier > 0 && <span className="mult" style={{ color: KIND_COLOR[f.kind] }}>{formatMultiplier(f.multiplier)}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function HistoryStrip() {
  const history = useGame((s) => s.history);
  if (!history.length) return null;
  return (
    <div className="panel">
      <h2>{t('history.title')}</h2>
      <div className="history-strip">
        {history.map((h) => (
          <div key={h.roundId} className={`hist ${h.won ? 'win' : 'loss'}`} title={`nonce ${h.nonce}`}>
            {h.ending === 'sudden-death' ? '✕' : formatMultiplier(h.multiplier)}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FairnessPanel() {
  const g = useGame();
  const [open, setOpen] = useState(false);
  const c = g.commitment;
  if (!c) return null;
  return (
    <div className="panel">
      <h2>{t('fair.title')}</h2>
      <div className="kv"><span>{t('fair.serverHash')}</span><code>{c.serverSeedHash.slice(0, 20)}…</code></div>
      <div className="kv"><span>{t('fair.nonce')}</span><code>{c.nonce}</code></div>
      <label className="kv" style={{ alignItems: 'center' }}>
        <span>{t('fair.clientSeed')}</span>
      </label>
      <div style={{ display: 'flex', gap: 6 }}>
        <input className="text" value={g.clientSeedInput} onChange={(e) => g.setClientSeedInput(e.target.value)} aria-label={t('fair.clientSeed')} />
        <button className="ghost-btn" style={{ flex: 'none', padding: '0 10px' }} onClick={() => g.commitClientSeed()}>Set</button>
      </div>
      <button className="link-btn" onClick={() => setOpen(true)}>{t('fair.verify')} →</button>
      {open && <VerifyModal onClose={() => setOpen(false)} />}
    </div>
  );
}

function VerifyModal({ onClose }: { onClose: () => void }) {
  const lastReveal = useGame((s) => s.settlement?.reveal);
  const houseEdge = useGame((s) => s.config?.houseEdge ?? 0.03);
  const [serverSeed, setServerSeed] = useState(lastReveal?.serverSeed ?? '');
  const [clientSeed, setClientSeed] = useState(lastReveal?.clientSeed ?? '');
  const [nonce, setNonce] = useState(String(lastReveal?.nonce ?? 0));
  const [hash, setHash] = useState(lastReveal?.serverSeedHash ?? '');
  const [out, setOut] = useState<string>('');

  const run = () => {
    try {
      const r = verifyRound(serverSeed, clientSeed, Number(nonce), hash || undefined, houseEdge);
      setOut(JSON.stringify(r, null, 2));
    } catch (e) {
      setOut(`Error: ${(e as Error).message}`);
    }
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="panel modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Verify a round">
        <button className="icon-btn close" onClick={onClose} aria-label="close">✕</button>
        <h2>{t('fair.verify')}</h2>
        <p style={{ color: 'var(--ink-faint)', fontSize: 12 }}>
          Reproduce any round's mortality point from its revealed seeds. Runs entirely in your browser using the same code the engine ships.
        </p>
        <label className="sr-only" htmlFor="v-srv">server seed</label>
        <input id="v-srv" className="text" placeholder="revealed server seed" value={serverSeed} onChange={(e) => setServerSeed(e.target.value)} style={{ marginBottom: 6 }} />
        <input className="text" placeholder="client seed" value={clientSeed} onChange={(e) => setClientSeed(e.target.value)} style={{ marginBottom: 6 }} />
        <input className="text" placeholder="nonce" value={nonce} onChange={(e) => setNonce(e.target.value)} style={{ marginBottom: 6 }} />
        <input className="text" placeholder="committed hash (optional)" value={hash} onChange={(e) => setHash(e.target.value)} />
        <button className="primary" style={{ marginTop: 10 }} onClick={run}>Verify</button>
        {out && <pre className="verify-out">{out}</pre>}
      </div>
    </div>
  );
}

export function SettingsMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const g = useGame();
  const cfg = g.config;
  if (!open) return null;
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="panel modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Settings">
        <button className="icon-btn close" onClick={onClose} aria-label="close">✕</button>
        <h2>Settings</h2>
        <SettingRow label={t('settings.sound')} on={!g.settings.muted} onToggle={() => g.toggleMuted()} />
        <SettingRow label={t('settings.motion')} on={g.settings.reducedMotion} onToggle={() => g.toggleReducedMotion()} />
        <SettingRow label={t('settings.auto')} on={g.settings.autoPlay} onToggle={() => g.toggleAutoPlay()} />
        <h2 style={{ marginTop: 16 }}>Skin</h2>
        <div className="choice-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {['human', 'cosmos'].map((id) => (
            <button key={id} className="choice" aria-pressed={g.skinId === id} onClick={() => g.setSkin(id)}>
              <b>{id === 'human' ? 'A Human Life' : 'The Life of a Star'}</b>
              <small>{id === 'human' ? 'Flagship' : 'Alternate'}</small>
            </button>
          ))}
        </div>
        {cfg && (
          <>
            <h2 style={{ marginTop: 16 }}>{t('rg.session')} · Responsible gaming</h2>
            <p style={{ color: 'var(--ink-faint)', fontSize: 12 }}>
              RTP {((1 - cfg.houseEdge) * 100).toFixed(0)}% · reality-check every {cfg.responsibleGaming.sessionReminderMinutes} min.
              Loss/time limits are operator-configurable hooks.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function SettingRow({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="toggle-row">
      <div className="label"><b>{label}</b></div>
      <button className="switch" role="switch" aria-checked={on} aria-pressed={on} aria-label={label} onClick={onToggle} />
    </div>
  );
}

import { useGame } from '../state/store';
import { t, formatCurrency, formatMultiplier } from './i18n';
import { getSkin } from '../skins';
import { sound } from '../audio/sound';

/** Pre-life: balance-aware betting + declaration (disposition, ambition, Beyond). */
export function PreLifePanel() {
  const g = useGame();
  const cfg = g.config;
  if (!cfg) return null;
  const disp = cfg.dispositions.find((d) => d.id === g.draft.dispositionId)!;
  const amb = cfg.ambitions.find((a) => a.id === g.draft.ambitionId)!;
  const potential = g.draft.stake * amb.target;
  const canBet = g.draft.stake <= g.balance && g.draft.stake >= cfg.minBet;

  return (
    <div className="dock">
      <div className="panel">
        <h2>{t('bet.stake')}</h2>
        <div className="stake-row">
          <button className="round-btn" aria-label="decrease stake" onClick={() => { sound.cue('click'); g.adjustStake(-roundStep(g.draft.stake)); }}>−</button>
          <div className="stake-display">
            <span>{t('bet.stake')}</span>
            <b>{formatCurrency(g.draft.stake, cfg.currency, cfg.locale)}</b>
          </div>
          <button className="round-btn" aria-label="increase stake" onClick={() => { sound.cue('click'); g.adjustStake(roundStep(g.draft.stake)); }}>+</button>
        </div>
        <div className="chips">
          {[1, 5, 25, 100].map((c) => (
            <button key={c} onClick={() => { sound.cue('click'); g.setStake(c); }}>{formatCurrency(c, cfg.currency, cfg.locale)}</button>
          ))}
          <button onClick={() => g.setStake(g.balance)}>Max</button>
        </div>
      </div>

      <div className="panel">
        <h2>{t('declare.disposition')}</h2>
        <div className="choice-grid">
          {cfg.dispositions.map((d) => (
            <button key={d.id} className="choice" aria-pressed={d.id === disp.id} onClick={() => { sound.cue('click'); g.setDisposition(d.id); }}>
              <b>{d.name}</b>
              <small>{dispositionBlurb(d.id)}</small>
            </button>
          ))}
        </div>
        <h2 style={{ marginTop: 14 }}>{t('declare.ambition')}</h2>
        <div className="choice-grid">
          {cfg.ambitions.map((a) => (
            <button key={a.id} className="choice" aria-pressed={a.id === amb.id} onClick={() => { sound.cue('click'); g.setAmbition(a.id); }}>
              <b>{formatMultiplier(a.target)}</b>
              <small>{a.name}</small>
            </button>
          ))}
        </div>
        <div className="toggle-row">
          <div className="label">
            <b>{t('declare.beyond')}</b>
            <small>{t('declare.beyondHint')}</small>
          </div>
          <button className="switch" role="switch" aria-checked={g.draft.beyondWager} aria-pressed={g.draft.beyondWager} aria-label={t('declare.beyond')} onClick={() => { sound.cue('click'); g.toggleBeyond(); }} />
        </div>
      </div>

      <div className="panel">
        <button className="primary" disabled={!canBet} onClick={() => { sound.unlock(); sound.cue('birth'); g.beginLife(); }}>
          {t('bet.begin')}
        </button>
        <div className="potential">
          {canBet ? (
            <>{t('bet.potential')}: <b>{formatCurrency(potential, cfg.currency, cfg.locale)}</b> at {formatMultiplier(amb.target)}</>
          ) : (
            <>Insufficient balance for this stake.</>
          )}
        </div>
      </div>
    </div>
  );
}

/** Live HUD: Worth / Vitality readouts, pace, re-declare and Rest. */
export function LiveHud() {
  const g = useGame();
  const cfg = g.config!;
  const v = g.view;
  if (!v) return null;
  const worth = v.worth;
  const potential = g.activeStake * worth;
  const vit = Math.round(v.vitality * 100);
  const stageName = getSkin(g.skinId).stageNames[stageIndexOf(v.stage.id)] ?? v.stage.name;

  return (
    <div className="dock">
      <div className="panel" aria-live="polite">
        <div className="meters">
          <div className="meter worth">
            <div className="top"><span>{t('live.worth')}</span><span>{stageName}</span></div>
            <div className="big">{formatMultiplier(worth)}</div>
            <div className="bar"><i style={{ width: `${Math.min(100, (Math.log2(worth) / Math.log2(v.target)) * 100)}%` }} /></div>
          </div>
          <div className="meter vit">
            <div className="top"><span>{t('live.vitality')}</span><span>{t('live.target')} {formatMultiplier(v.target)}</span></div>
            <div className="big">{vit}%</div>
            <div className="bar"><i style={{ width: `${vit}%` }} /></div>
          </div>
        </div>

        <div className="pace-row" role="group" aria-label="pace">
          {(['push', 'coast', 'tend'] as const).map((p) => (
            <button key={p} className={`pace-btn ${p}`} aria-pressed={v.pace === p} onClick={() => { sound.cue('click'); g.setPace(p); }}>
              {t(`live.${p}`)}
            </button>
          ))}
        </div>

        <div className="live-actions">
          <button className="rest-btn" onClick={() => { sound.cue('rest'); g.rest(); }}>
            {t('live.rest')} · <b>{formatCurrency(potential, cfg.currency, cfg.locale)}</b>
          </button>
          <button className="ghost-btn" aria-label={t('live.redeclare')} onClick={() => { sound.cue('click'); g.reDeclare(Math.max(1.2, v.target / 2)); }}>
            {t('live.redeclare')}
            <br />↓ {formatMultiplier(Math.max(1.2, v.target / 2))}
          </button>
        </div>
      </div>
    </div>
  );
}

/** The Reckoning overlay — animated resolution + payout. */
export function Reckoning() {
  const g = useGame();
  const s = g.settlement;
  const cfg = g.config!;
  if (!s) return null;
  const skin = getSkin(g.skinId);
  const win = s.payout > 0;
  const verdict =
    s.ending === 'sudden-death' ? t('reckoning.suddenDeath') : s.ending === 'fulfil' ? t('reckoning.fulfilled') : t('reckoning.rested');
  const poem =
    s.ending === 'sudden-death'
      ? skin.copy.suddenDeath
      : s.beyond?.bucket === 'legacy'
        ? skin.copy.legacy
        : s.beyond?.bucket === 'dark'
          ? skin.copy.dark
          : s.ending === 'fulfil'
            ? skin.copy.fulfil
            : skin.copy.rest;

  return (
    <div className="reckoning" role="dialog" aria-modal="true" aria-label="Reckoning">
      <div className="reckoning-card">
        {s.beyond && (
          <div className="beyond-badge" style={{ color: skin.legacy }}>
            The Beyond · {s.beyond.bucket === 'legacy' ? 'Legacy' : s.beyond.bucket === 'dark' ? 'Dark End' : 'Nothing'} ×{s.beyond.multiplier}
          </div>
        )}
        <p className="verdict">{verdict}</p>
        <p className="poem">{poem}</p>
        <div className={`payout ${win ? 'win' : 'zero'}`}>{formatCurrency(s.payout, cfg.currency, cfg.locale)}</div>
        <div className="sub">
          {win ? `${formatMultiplier(s.payoutMultiplier)} on ${formatCurrency(s.stake, cfg.currency, cfg.locale)}` : `The stake of ${formatCurrency(s.stake, cfg.currency, cfg.locale)} returns to the earth`}
        </div>
        <button className="primary" onClick={() => g.dismissReckoning()}>{t('reckoning.again')}</button>
      </div>
    </div>
  );
}

// ---- small helpers & copy ----
function roundStep(stake: number): number {
  if (stake < 5) return 1;
  if (stake < 25) return 5;
  if (stake < 100) return 25;
  return 50;
}
function dispositionBlurb(id: string): string {
  return id === 'spark' ? 'Vivid, fast, fragile' : id === 'steady' ? 'Calm, grounded, enduring' : 'Balanced traveller';
}
export function stageIndexOf(id: string): number {
  return ['infant', 'child', 'youth', 'adult', 'prime', 'elder'].indexOf(id);
}

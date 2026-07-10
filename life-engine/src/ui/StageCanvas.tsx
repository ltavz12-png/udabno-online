import { useEffect, useRef } from 'react';
import { LifeStage } from '../stage/LifeStage';
import { useGame } from '../state/store';
import { getSkin } from '../skins';
import { sound } from '../audio/sound';

/** Mounts the PixiJS LifeStage and streams store state into it each frame. */
export function StageCanvas({ skinId }: { skinId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const stageRef = useRef<LifeStage | null>(null);

  useEffect(() => {
    let disposed = false;
    const stage = new LifeStage();
    stageRef.current = stage;
    const parent = ref.current!;
    stage
      .init(parent, (cue) => {
        if (cue === 'birth' || cue === 'milestone' || cue === 'legacy' || cue === 'death' || cue === 'rest')
          sound.cue(cue);
      })
      .then(() => {
        if (disposed) stage.destroy();
      });
    return () => {
      disposed = true;
      stage.destroy();
      stageRef.current = null;
    };
  }, []);

  // Feed store → stage on every relevant change.
  useEffect(() => {
    const unsub = useGame.subscribe((s) => {
      const stage = stageRef.current;
      if (!stage) return;
      const view = s.view;
      const active = s.status === 'living' || s.status === 'reckoning';
      const disp = s.draft.dispositionId;
      const settlement = s.settlement;
      stage.setInput({
        active,
        worth: view?.worth ?? 1,
        vitality: view?.vitality ?? 1,
        pace: view?.pace ?? 'coast',
        dispositionId: disp,
        ending: view?.ending ?? null,
        beyond: settlement?.beyond ?? view?.outcome?.beyond ?? null,
        skin: getSkin(skinId),
        reducedMotion: s.settings.reducedMotion,
        social: s.otherLives,
      });
    });
    return unsub;
  }, [skinId]);

  return <div className="stage-canvas" ref={ref} aria-hidden="true" />;
}

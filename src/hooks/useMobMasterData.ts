import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { validateMobMaster } from '@/domain/mobMaster';

/** Mob の静的マスターを読み込み、検証済みデータだけを Application へ渡す。 */
export function useMobMasterData() {
  const product = useAppStore((state) => state.product);
  const setMobMaster = useAppStore((state) => state.setMobMaster);

  useEffect(() => {
    if (product !== 'mob') return;
    let cancelled = false;
    fetch('/json/mobs.json')
      .then((response) => {
        if (!response.ok) throw new Error('Mob master request failed');
        return response.json() as Promise<unknown>;
      })
      .then((raw) => {
        if (cancelled) return;
        const result = validateMobMaster(raw);
        setMobMaster(result.ok ? result.data ?? null : null, result.reason);
      })
      .catch(() => {
        if (!cancelled) setMobMaster(null, 'Mob マスターデータを読み込めません');
      });
    return () => {
      cancelled = true;
    };
  }, [product, setMobMaster]);
}

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { GRADE_JSON_MAP } from '@/constants';

/**
 * グレードに応じたJSONとマップ画像を非同期ロードするフック
 */
export function useMapData() {
  const grade = useAppStore(s => s.grade);
  const setMapData = useAppStore(s => s.setMapData);
  const setIsLoading = useAppStore(s => s.setIsLoading);
  const recalcRoute = useAppStore(s => s.recalcRoute);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setMapData(null);

    const url = GRADE_JSON_MAP[grade];
    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        setMapData(data);
        setIsLoading(false);
        recalcRoute();
      })
      .catch(() => {
        if (cancelled) return;
        console.error(`Failed to load map data: ${url}`);
        setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [grade, setMapData, setIsLoading, recalcRoute]);
}

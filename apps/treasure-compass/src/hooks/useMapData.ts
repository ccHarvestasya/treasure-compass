import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { GRADE_JSON_MAP } from '@/constants';
import { isValidMapData } from '@/utils/mapData';

/**
 * グレードに応じたJSONとマップ画像を非同期ロードするフック
 */
export function useMapData() {
  const grade = useAppStore(s => s.grade);
  const setMapData = useAppStore(s => s.setMapData);
  const setMapDataError = useAppStore(s => s.setMapDataError);
  const setIsLoading = useAppStore(s => s.setIsLoading);
  const recalcRoute = useAppStore(s => s.recalcRoute);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setMapDataError(null);
    setMapData(null);

    const url = GRADE_JSON_MAP[grade];
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        if (cancelled) return;
        if (!isValidMapData(data)) throw new Error('Invalid map data');
        setMapData(data);
        setIsLoading(false);
        recalcRoute();
      })
      .catch(() => {
        if (cancelled) return;
        setMapDataError('マップデータを読み込めませんでした。時間をおいて再試行してください。');
        setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [grade, setMapData, setMapDataError, setIsLoading, recalcRoute]);
}

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { GRADE_JSON_MAP } from '@/constants';
import { MAP_MASTER_IDS_BY_GRADE } from '@/constants';
import { isValidGradeMapData } from '@/utils/mapData';
import mapMasterJson from '@treasure-compass/master-data/data/map-master.v1.json';
import { validateMapMaster } from '@treasure-compass/master-data';

const mapMasterValidation = validateMapMaster(mapMasterJson);
const mapMaster = mapMasterValidation.data;

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
        const expectedMaps = (MAP_MASTER_IDS_BY_GRADE[grade] ?? []).map(
          (mapId, index) => {
            const map = mapMaster?.maps.find((candidate) => candidate.id === mapId);
            return {
              mapNo: index + 1,
              mapName: map?.name ?? '',
              mapNameShort: map?.shortName ?? '',
            };
          },
        );
        if (!mapMaster || !isValidGradeMapData(data, expectedMaps)) {
          throw new Error('Invalid map data');
        }
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

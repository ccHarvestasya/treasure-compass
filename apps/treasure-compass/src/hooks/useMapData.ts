import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MAP_MASTER_IDS_BY_GRADE } from '@/constants';
import { buildTreasureMapData, isValidGradeMapData } from '@/utils/mapData';
import mapMasterJson from '@treasure-compass/master-data/data/map-master.v1.json';
import { validateMapMaster, validateTreasureMaster } from '@treasure-compass/master-data';
import treasureMasterJson from '@treasure-compass/master-data/data/treasure-master.v1.json';

const mapMasterValidation = validateMapMaster(mapMasterJson);
const mapMaster = mapMasterValidation.data;
const treasureMasterValidation = mapMaster
  ? validateTreasureMaster(treasureMasterJson, mapMaster)
  : null;

/**
 * 検証済みmaster-dataからグレード別のMapDataを構築するフック
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

    Promise.resolve().then(() => {
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
        const data = mapMaster && treasureMasterValidation?.data
          ? buildTreasureMapData(mapMaster, treasureMasterValidation.data, grade, MAP_MASTER_IDS_BY_GRADE[grade] ?? [])
          : null;
        if (!data || !isValidGradeMapData(data, expectedMaps)) {
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

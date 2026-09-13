import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MAP_MASTER_IDS_BY_GRADE } from '@/constants';
import { buildTreasureCatalog } from '@/utils/mapData';
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
  const setCatalog = useAppStore(s => s.setCatalog);
  const setMapDataError = useAppStore(s => s.setMapDataError);
  const setIsLoading = useAppStore(s => s.setIsLoading);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setMapDataError(null);
    setCatalog(null);

    Promise.resolve().then(() => {
        if (cancelled) return;
        const catalog = mapMaster && treasureMasterValidation?.data
          ? buildTreasureCatalog(mapMaster, treasureMasterValidation.data, MAP_MASTER_IDS_BY_GRADE)
          : null;
        if (!catalog) {
          throw new Error('Invalid map data');
        }
        setCatalog(catalog);
        setIsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setMapDataError('マップデータを読み込めませんでした。時間をおいて再試行してください。');
        setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [setCatalog, setMapDataError, setIsLoading]);
}

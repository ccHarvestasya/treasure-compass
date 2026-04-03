import type { MapDataItem, Point } from '@/types';
import { COORD_SEARCH_RADIUS_1, COORD_SEARCH_RADIUS_2, DEFAULT_MEMBER_NAME } from '@/constants';

/**
 * FFXIVパーティチャットからメンバー情報を一括解析する
 * 形式: (★PlayerName)  マップ名 (X.x, Y.y)
 *       (.●PlayerName) マップ名 (X.x, Y.y)  など
 */

export interface ParsedMember {
  memberName: string;
  mapName: string;
  coordX: number;
  coordY: number;
}

// FFXIVチャット座標の形式に対応
// 例: [21:57] (Mimosa Sami) リビング・メモリー ( 20.5  , 23.0 )
const CHAT_REGEX = /[（(][★☆●▲◆♥♠♣◇♦♣♧♤♡○□△▽]?\s?(.+?)[)）]\s+(.+?)\s+[（(]\s*(\d+(?:\.\d+)?)\s*[,，]\s*(\d+(?:\.\d+)?)\s*[)）]/;

export function parseBulkInput(
  text: string,
  _allMapData: MapDataItem[],
): ParsedMember[] {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const results: ParsedMember[] = [];

  for (const line of lines) {
    const match = CHAT_REGEX.exec(line);
    if (!match) continue;

    const memberName = match[1].trim() || DEFAULT_MEMBER_NAME;
    const mapName = match[2].trim();
    const coordX = parseFloat(match[3]);
    const coordY = parseFloat(match[4]);

    results.push({ memberName, mapName, coordX, coordY });
  }

  return results;
}

/** 
 * FFXIV表示座標(例: 12.3, 45.6)からJSONポイントを探す
 * FFXIV座標 = (posX / 10) に相当（スケール10倍）
 */
export function findPointByCoord(
  coordX: number,
  coordY: number,
  mapData: MapDataItem,
): Point | null {
  const treasurePoints = mapData.point.filter(p => p.division === 'P');

  // ±1.0 で検索
  const found = searchNearest(coordX, coordY, treasurePoints, COORD_SEARCH_RADIUS_1);
  if (found) return found;

  // ±2.0 に拡張
  return searchNearest(coordX, coordY, treasurePoints, COORD_SEARCH_RADIUS_2);
}

function searchNearest(
  coordX: number,
  coordY: number,
  points: Point[],
  radius: number,
): Point | null {
  let nearest: Point | null = null;
  let minDist = Infinity;

  for (const p of points) {
    // JSONのposX/posY → FFXIV座標変換 (÷10 + オフセット)
    const px = p.posX / 10;
    const py = p.posY / 10;
    const dx = coordX - px;
    const dy = coordY - py;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= radius && dist < minDist) {
      minDist = dist;
      nearest = p;
    }
  }

  return nearest;
}

/**
 * マップ名からMapDataItemを探す（部分一致対応）
 */
export function findMapByName(
  mapName: string,
  allMapData: MapDataItem[],
): MapDataItem | null {
  // 完全一致優先
  const exact = allMapData.find(m => m.mapName === mapName || m.mapNameShort === mapName);
  if (exact) return exact;

  // 部分一致
  return allMapData.find(m =>
    m.mapName.includes(mapName) ||
    mapName.includes(m.mapName) ||
    m.mapNameShort.includes(mapName) ||
    mapName.includes(m.mapNameShort)
  ) ?? null;
}

import {
  COORD_SEARCH_RADIUS_1,
  COORD_SEARCH_RADIUS_2,
} from "@/constants";
import type { MapDataItem, Point, TreasureCandidate, TreasureCatalog } from "@/types";

export interface ParsedMember {
  lineNumber: number;
  memberName: string;
  mapName: string;
  coordX: number;
  coordY: number;
}

export type BulkRowStatus = "resolved" | "ambiguous" | "unresolved";

export interface BulkRow {
  lineNumber: number;
  raw: string;
  parsed: ParsedMember | null;
  status: BulkRowStatus;
  reason: string | null;
  candidates: TreasureCandidate[];
  selectedCandidate: TreasureCandidate | null;
}

const MARKERS = "★☆●▲◆♥♠♣◇♦♡○□△▽";
const FFXIV_PRIVATE_USE_AREA_PREFIX = /^[\uE000-\uF8FF]/;
const NUMBER = "(\\d+(?:\\.\\d+)?)";
const CHAT_LINE = new RegExp(
  `[（(]([${MARKERS}]?)([^()（）]+)[)）]\\s+(.+?)\\s+[（(]\\s*${NUMBER}\\s*[,，]\\s*${NUMBER}\\s*[)）]`,
);
const COORDINATE_EXPRESSION = /[（(]\s*\d+(?:\.\d+)?\s*[,，]\s*\d+(?:\.\d+)?\s*[)）]/g;

function normalizeName(value: string): string {
  return value.trim().normalize("NFC");
}

function normalizeMemberName(value: string): string {
  return value
    .trim()
    .replace(FFXIV_PRIVATE_USE_AREA_PREFIX, "")
    .replace(new RegExp(`^[${MARKERS}]+`), "")
    .normalize("NFC");
}

function coordinateExpressionCount(value: string): number {
  return value.match(COORDINATE_EXPRESSION)?.length ?? 0;
}

function distanceToCoordinate(point: Point, x: number, y: number): number {
  return Math.hypot(point.posX / 10 - x, point.posY / 10 - y);
}

function candidateDistance(candidate: TreasureCandidate, x: number, y: number): number {
  return distanceToCoordinate(candidate.point, x, y);
}

export function parseBulkInput(text: string): ParsedMember[] {
  return text
    .split(/\r?\n/)
    .map((raw, index) => ({ raw, lineNumber: index + 1 }))
    .filter(({ raw }) => raw.trim().length > 0)
    .flatMap(({ raw, lineNumber }) => {
      if (coordinateExpressionCount(raw) !== 1) return [];
      const match = CHAT_LINE.exec(raw);
      if (!match) return [];
      const memberName = normalizeMemberName(match[2] ?? "");
      const mapName = normalizeName(match[3] ?? "");
      const coordX = Number(match[4]);
      const coordY = Number(match[5]);
      if (!memberName || !mapName || !Number.isFinite(coordX) || !Number.isFinite(coordY)) return [];
      return [{ lineNumber, memberName, mapName, coordX, coordY }];
    });
}

export function findMapCandidatesByName(
  mapName: string,
  allMapData: MapDataItem[],
): MapDataItem[] {
  const name = normalizeName(mapName);
  const exact = allMapData.filter(
    (map) => map.mapName === name || map.mapNameShort === name,
  );
  if (exact.length > 0) return [...new Map(exact.map((map) => [map.mapId ?? String(map.mapNo), map])).values()];
  const partial = allMapData.filter(
    (map) =>
      map.mapName.includes(name) ||
      name.includes(map.mapName) ||
      map.mapNameShort.includes(name) ||
      name.includes(map.mapNameShort),
  );
  return [...new Map(partial.map((map) => [map.mapId ?? String(map.mapNo), map])).values()];
}

export function findMapByName(mapName: string, allMapData: MapDataItem[]): MapDataItem | null {
  const candidates = findMapCandidatesByName(mapName, allMapData);
  return candidates.length === 1 ? candidates[0] ?? null : null;
}

function pointsNear(
  x: number,
  y: number,
  points: Point[],
  radius: number,
): Point[] {
  return points
    .filter((point) => point.division === "P" && distanceToCoordinate(point, x, y) <= radius)
    .sort((left, right) => {
      const distance = distanceToCoordinate(left, x, y) - distanceToCoordinate(right, x, y);
      return distance || (left.stableId ?? "").localeCompare(right.stableId ?? "");
    });
}

export function findPointByCoord(coordX: number, coordY: number, mapData: MapDataItem): Point | null {
  const first = pointsNear(coordX, coordY, mapData.point, COORD_SEARCH_RADIUS_1);
  if (first.length > 0) return first[0] ?? null;
  return pointsNear(coordX, coordY, mapData.point, COORD_SEARCH_RADIUS_2)[0] ?? null;
}

function candidatesNear(catalog: TreasureCatalog, map: MapDataItem, x: number, y: number, radius: number): TreasureCandidate[] {
  return catalog.candidates
    .filter((candidate) => candidate.map.mapId === map.mapId && candidate.map.mapNo === map.mapNo)
    .filter((candidate) => candidateDistance(candidate, x, y) <= radius)
    .sort((left, right) => {
      const distance = candidateDistance(left, x, y) - candidateDistance(right, x, y);
      return distance || left.pointRef.pointId.localeCompare(right.pointRef.pointId);
    });
}

export function analyzeBulkInput(text: string, catalog: TreasureCatalog): BulkRow[] {
  return text
    .split(/\r?\n/)
    .map((raw, index) => ({ raw, lineNumber: index + 1 }))
    .filter(({ raw }) => raw.trim().length > 0)
    .map(({ raw, lineNumber }) => {
      if (coordinateExpressionCount(raw) > 1) {
        return { lineNumber, raw, parsed: null, status: "ambiguous", reason: "複数の座標候補があります", candidates: [], selectedCandidate: null };
      }
      const match = CHAT_LINE.exec(raw);
      if (!match) {
        return { lineNumber, raw, parsed: null, status: "unresolved", reason: "形式を認識できません", candidates: [], selectedCandidate: null };
      }
      const memberName = normalizeMemberName(match[2] ?? "");
      const mapName = normalizeName(match[3] ?? "");
      const coordX = Number(match[4]);
      const coordY = Number(match[5]);
      const parsed = { lineNumber, memberName, mapName, coordX, coordY };
      if (!memberName) return { lineNumber, raw, parsed, status: "unresolved", reason: "名前がありません", candidates: [], selectedCandidate: null };
      if (!Number.isFinite(coordX) || !Number.isFinite(coordY)) return { lineNumber, raw, parsed, status: "unresolved", reason: "座標が不正です", candidates: [], selectedCandidate: null };
      const maps = findMapCandidatesByName(mapName, catalog.mapData.mapData);
      if (maps.length === 0) return { lineNumber, raw, parsed, status: "unresolved", reason: "マップが見つかりません", candidates: [], selectedCandidate: null };
      const candidates = maps.flatMap((map) => candidatesNear(catalog, map, coordX, coordY, COORD_SEARCH_RADIUS_1));
      const expanded = candidates.length > 0 ? candidates : maps.flatMap((map) => candidatesNear(catalog, map, coordX, coordY, COORD_SEARCH_RADIUS_2));
      const unique = [...new Map(expanded.map((candidate) => [
        `${candidate.pointRef.gradeSetId}:${candidate.pointRef.mapId}:${candidate.pointRef.pointId}`,
        candidate,
      ])).values()];
      if (unique.length === 0) return { lineNumber, raw, parsed, status: "unresolved", reason: "座標に一致する地点がありません", candidates: [], selectedCandidate: null };
      if (maps.length > 1) return { lineNumber, raw, parsed, status: "ambiguous", reason: "複数の正規マップに一致します", candidates: unique, selectedCandidate: null };
      if (unique.length === 1) return { lineNumber, raw, parsed, status: "resolved", reason: null, candidates: unique, selectedCandidate: unique[0] ?? null };
      return { lineNumber, raw, parsed, status: "ambiguous", reason: "バージョンまたは地点が曖昧です", candidates: unique, selectedCandidate: null };
    });
}

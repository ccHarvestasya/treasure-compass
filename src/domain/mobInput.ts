import type { MobMasterData, MobRowResult } from '@/types';
import { candidateFromMaster, resolveMap, resolveMob } from './mobMaster';
import { mobCandidateId } from './mobMaster';
import { normalizeCoordinate, normalizeText } from './normalization';

export interface ParsedMobRow {
  mobName: string;
  mapName: string;
  x: number;
  y: number;
}

export interface ParsedMobRowResult {
  result: MobRowResult;
  row?: ParsedMobRow;
}

export interface MobInputParseResult {
  rows: ParsedMobRowResult[];
}

function parseRow(line: string): ParsedMobRow | null {
  if (!line.startsWith('mob: ') || line.includes('\r')) return null;
  const fields = line.slice(5).split(' | ');
  if (fields.length !== 3 || fields.some((field) => field.includes('%'))) return null;
  const [mobNameValue, mapNameValue, coordinates] = fields;
  const mobName = normalizeText(mobNameValue);
  const mapName = normalizeText(mapNameValue);
  if (!mobName || !mapName) return null;
  const coordinateFields = coordinates.split(',');
  if (coordinateFields.length !== 2) return null;
  const x = normalizeCoordinate(coordinateFields[0]);
  const y = normalizeCoordinate(coordinateFields[1]);
  if (x === null || y === null) return null;
  return { mobName, mapName, x, y };
}

export function parseMobInput(text: string, master?: MobMasterData): MobInputParseResult {
  if (typeof text !== 'string') return { rows: [] };
  const rows: ParsedMobRowResult[] = [];
  for (const rawLine of text.replaceAll('\r\n', '\n').split('\n')) {
    if (!rawLine.trim()) continue;
    const row = parseRow(rawLine);
    if (!row) {
      rows.push({ result: { status: 'invalid', reason: '行の形式または座標が不正です' } });
      continue;
    }
    if (!master) {
      rows.push({ result: { status: 'invalid', reason: 'Mob マスターデータがありません' }, row });
      continue;
    }
    const mob = resolveMob(master, row.mobName);
    const map = resolveMap(master, row.mapName);
    if (!mob) {
      rows.push({ result: { status: 'invalid', reason: '未知のモブです' }, row });
      continue;
    }
    if (!map) {
      rows.push({ result: { status: 'invalid', reason: '未知のマップです' }, row });
      continue;
    }
    const location = mob.locations.find((entry) => entry.mapId === map.id && entry.x === row.x && entry.y === row.y);
    if (!location) {
      rows.push({ result: { status: 'invalid', reason: 'モブに対応する地点がありません' }, row });
      continue;
    }
    const candidate = candidateFromMaster(master, location);
    if (!candidate) {
      rows.push({ result: { status: 'invalid', reason: '地点を解決できません' }, row });
      continue;
    }
    rows.push({ result: { status: 'valid', mobId: mob.id, candidateId: mobCandidateId(map.id, row.x, row.y) }, row });
  }
  return { rows };
}

export function normalizeMobInputRow(row: ParsedMobRow): ParsedMobRow | null {
  const mobName = normalizeText(row.mobName);
  const mapName = normalizeText(row.mapName);
  if (!mobName || !mapName) return null;
  return { mobName, mapName, x: row.x, y: row.y };
}

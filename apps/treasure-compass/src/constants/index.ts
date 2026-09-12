import type { Grade } from "@/types";
import { TREASURE_MEMBER_SLOTS } from "@treasure-compass/treasure-domain";

export const CANVAS_SIZE = 658;
export const FULL_PARTY = TREASURE_MEMBER_SLOTS;
export const TELEPORT_TIME_COST = 25;
export const BULK_INPUT_DELAY_MS = 1500;
export const COORD_SEARCH_RADIUS_1 = 1.0;
export const COORD_SEARCH_RADIUS_2 = 2.0;
export const FFXIV_COORD_SCALE = 10;

export const STORAGE_KEY_GRADE = "treasure-compass:grade";
export const STORAGE_KEY_MEMBERS = "treasure-compass:members";

/**
 * グレード設定テーブル。
 * 新グレードを追加するにはここに1行追加するだけです。
 */
export interface GradeConfig {
  grade: Grade;
  label: string;
}

export const GRADE_CONFIG: GradeConfig[] = [
  {
    grade: 8,
    label: "3.x",
  },
  {
    grade: 10,
    label: "4.x",
  },
  {
    grade: 12,
    label: "5.x",
  },
  {
    grade: 14,
    label: "6.x",
  },
  {
    grade: 17,
    label: "7.x",
  },
  // 新グレード追加時は、対応するバージョン管理済み master data も追加する。
];

export const GRADES: Grade[] = GRADE_CONFIG.map((c) => c.grade);
export const DEFAULT_GRADE: Grade = GRADE_CONFIG[GRADE_CONFIG.length - 1].grade;

export function getGradeConfig(grade: Grade): GradeConfig {
  const cfg = GRADE_CONFIG.find((c) => c.grade === grade);
  if (!cfg) throw new Error(`Unknown grade: ${grade}`);
  return cfg;
}

// 後方互換のため既存のRecord形式アクセサを維持
export const GRADE_LABELS: Record<number, string> = Object.fromEntries(
  GRADE_CONFIG.map((c) => [c.grade, c.label]),
);

/**
 * 現行のlegacy入力（grade/mapNo）を、共通map masterの安定IDへ対応付ける。
 * map masterのIDはgradeや旧JSON名を含めず、masterのdataRevisionとともに管理する。
 */
export const MAP_MASTER_IDS_BY_GRADE: Readonly<Record<number, readonly string[]>> = {
  8: ['map-001', 'map-002', 'map-003', 'map-004'],
  10: ['map-005', 'map-006', 'map-007', 'map-008', 'map-009', 'map-010'],
  12: ['map-011', 'map-012', 'map-013', 'map-014', 'map-015', 'map-016'],
  14: ['map-017', 'map-018', 'map-019', 'map-020', 'map-021', 'map-022'],
  17: ['map-023', 'map-024', 'map-025', 'map-026', 'map-027', 'map-028'],
};

export const DEFAULT_MEMBER_NAME = "";

export const POINT_COLORS = {
  treasure: "#18181b",
  teleport: "#fb923c",
  active: "#facc15",
  completed: "#4ade80",
  route: "rgba(30,30,30,0.8)",
  text: "#f0f9ff",
} as const;

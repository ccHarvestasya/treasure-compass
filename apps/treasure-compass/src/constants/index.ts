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
 *   jsonFile   : public/json/ 以下のファイルパス
 */
export interface GradeConfig {
  grade: Grade;
  label: string;
  jsonFile: string;
}

export const GRADE_CONFIG: GradeConfig[] = [
  {
    grade: 8,
    label: "G8",
    jsonFile: "/json/g8.json",
  },
  {
    grade: 10,
    label: "G10",
    jsonFile: "/json/g10.json",
  },
  {
    grade: 12,
    label: "G12",
    jsonFile: "/json/g12.json",
  },
  {
    grade: 14,
    label: "G14/G15",
    jsonFile: "/json/g14.json",
  },
  {
    grade: 17,
    label: "G17/G18",
    jsonFile: "/json/g17.json",
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
export const GRADE_JSON_MAP: Record<number, string> = Object.fromEntries(
  GRADE_CONFIG.map((c) => [c.grade, c.jsonFile]),
);

export const DEFAULT_MEMBER_NAME = "";

export const POINT_COLORS = {
  treasure: "#18181b",
  teleport: "#fb923c",
  active: "#facc15",
  completed: "#4ade80",
  route: "rgba(30,30,30,0.8)",
  text: "#f0f9ff",
} as const;

import { readFileSync, writeFileSync } from "node:fs";

const datasets = [
  [8, "3.x", "g8", "source-001"],
  [10, "4.x", "g10", "source-002"],
  [12, "5.x", "g12", "source-003"],
  [14, "6.x", "g14", "source-004"],
  [17, "7.x", "g17", "source-005"],
];
const points = [];
const migration = [];

for (const [grade, _label, dataset, sourceId] of datasets) {
  const legacy = JSON.parse(readFileSync(`apps/treasure-compass/public/json/${dataset}.json`, "utf8"));
  for (const map of legacy.mapData) {
    const mapId = `map-${String(map.mapNo + (grade === 8 ? 0 : grade === 10 ? 4 : grade === 12 ? 10 : grade === 14 ? 16 : 22)).padStart(3, "0")}`;
    for (const point of map.point.filter(({ division }) => division === "P")) {
      const id = `${mapId}-point-${String(point.pointNo).padStart(3, "0")}`;
      points.push({ id, mapId, label: point.pointName, x: point.posX / 10, y: point.posY / 10, sourceIds: [sourceId] });
      migration.push({ dataset, grade, mapNo: map.mapNo, pointNo: point.pointNo, pointId: id });
    }
  }
}

const gradeSets = datasets.map(([grade, label, _dataset, sourceId]) => ({
  id: `treasure-grade-${grade}`,
  label,
  grades: [grade],
  sourceIds: [sourceId],
  points: points.filter((point) => migration.find((entry) => entry.pointId === point.id)?.grade === grade),
}));

writeFileSync("packages/master-data/data/treasure-master.v1.json", JSON.stringify({ schemaVersion: 1, dataRevision: "2026-09-12.1", gradeSets }, null, 2) + "\n");
writeFileSync("packages/master-data/migration/legacy-treasure-point.v1.json", JSON.stringify({ schemaVersion: 1, dataRevision: "2026-09-12.1", mappings: migration }, null, 2) + "\n");

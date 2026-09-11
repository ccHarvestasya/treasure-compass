export const MOB_COMPASS_MODES = ["solo", "party"] as const;

export type MobCompassMode = (typeof MOB_COMPASS_MODES)[number];

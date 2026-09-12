import { DEFAULT_GRADE, FULL_PARTY } from "@/constants";
import {
  readPersistedTreasure,
  writePersistedTreasure,
} from "@/persistence/storage";
import type { Grade, MapData, Point, RouteStep, UserItem } from "@/types";
import { calcShortestRoute, toRouteSteps } from "@/utils/distance";
import { create } from "zustand";

const restored = readPersistedTreasure();
const initialTreasure = restored.snapshot ?? {
  grade: DEFAULT_GRADE,
  members: Array<UserItem | null>(FULL_PARTY).fill(null),
};

const initialRoute = initialTreasure.route ?? [];
const initialManualSort = initialTreasure.isManualSort ?? false;
const initialActiveStep = initialTreasure.activeStep ?? 0;
const initialBulkText = initialTreasure.bulkText ?? "";
const initialCurrentMapPoints = initialTreasure.currentMapPoints ?? {};

function emptyMembers(): (UserItem | null)[] {
  return Array<UserItem | null>(FULL_PARTY).fill(null);
}

interface AppState {
  grade: Grade;
  setGrade: (grade: Grade) => void;
  setGradeWithReset: (grade: Grade) => void;
  mapData: MapData | null;
  setMapData: (data: MapData | null) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  members: (UserItem | null)[];
  setMember: (memberNo: number, item: UserItem) => void;
  removeMember: (memberNo: number) => void;
  draftMemberNames: string[];
  setDraftMemberName: (memberNo: number, name: string) => void;
  clearDraftMemberName: (memberNo: number) => void;
  clearMembers: () => void;
  clearAllData: () => void;
  route: RouteStep[];
  isManualSort: boolean;
  setRoute: (steps: RouteStep[]) => void;
  setManualSort: (value: boolean) => void;
  activeStep: number;
  setActiveStep: (value: number) => void;
  currentMapPoints: Record<string, Point>;
  completeStep: (index: number) => void;
  uncompleteStep: (index: number) => void;
  bulkText: string;
  setBulkText: (text: string) => void;
  modalMemberNo: number | null;
  openModal: (memberNo: number) => void;
  closeModal: () => void;
  recalcRoute: () => void;
}

function persistState(
  state: Pick<
    AppState,
    | "grade"
    | "members"
    | "route"
    | "isManualSort"
    | "activeStep"
    | "bulkText"
    | "currentMapPoints"
  >,
): boolean {
  return writePersistedTreasure({
    grade: state.grade,
    members: state.members,
    route: state.route,
    isManualSort: state.isManualSort,
    activeStep: state.activeStep,
    bulkText: state.bulkText,
    currentMapPoints: state.currentMapPoints,
  });
}

function persistNext(
  state: AppState,
  overrides: Partial<Pick<AppState, "grade" | "members" | "route" | "isManualSort" | "activeStep" | "bulkText" | "currentMapPoints">> = {},
): boolean {
  return persistState({ ...state, ...overrides });
}

function samePoint(left: RouteStep, right: UserItem): boolean {
  return (
    left.mapNo === right.mapNo &&
    left.point.pointNo === right.mapPoint.pointNo
  );
}

function createRouteStep(
  member: UserItem,
  mapData: MapData | null,
  currentMapPoints: Readonly<Record<string, Point>> = {},
): RouteStep | null {
  if (!mapData) return null;
  const result = calcShortestRoute(
    [
      {
        memberNo: member.memberNo,
        memberName: member.memberName,
        mapNo: member.mapNo,
        mapName: member.mapName,
        mapNameShort: member.mapNameShort,
        mapPoint: member.mapPoint,
      },
    ],
    mapData.mapData,
    currentMapPoints,
  );
  const step = result.orderedSteps[0];
  return step ? toRouteSteps([step])[0] ?? null : null;
}

function updateManualRoute(
  route: RouteStep[],
  members: (UserItem | null)[],
  mapData: MapData | null,
  changedMemberNo?: number,
  currentMapPoints: Readonly<Record<string, Point>> = {},
): RouteStep[] {
  const activeMembers = members.filter(
    (member): member is UserItem => member !== null,
  );
  const memberByNo = new Map(
    activeMembers.map((member) => [member.memberNo, member]),
  );
  const routeMemberNos = new Set<number>();
  const nextRoute: RouteStep[] = [];

  for (const step of route) {
    const member = memberByNo.get(step.memberNo);
    if (!member) continue;
    routeMemberNos.add(step.memberNo);
    if (step.memberNo !== changedMemberNo) {
      nextRoute.push(step);
      continue;
    }
    const replacement = createRouteStep(member, mapData, currentMapPoints);
    nextRoute.push(
      replacement
        ? {
            ...replacement,
            isCompleted: samePoint(step, member) ? step.isCompleted : false,
          }
        : step,
    );
  }

  for (const member of activeMembers) {
    if (routeMemberNos.has(member.memberNo)) continue;
    const appended = createRouteStep(member, mapData, currentMapPoints);
    if (appended) nextRoute.push(appended);
  }

  return nextRoute.map((step, index) => ({ ...step, orderNo: index + 1 }));
}

export const useAppStore = create<AppState>((set, get) => ({
  grade: initialTreasure.grade,
  setGrade: (grade) => {
    const state = get();
    if (!persistNext(state, { grade })) return;
    set({ grade, mapData: null, isLoading: true });
  },
  setGradeWithReset: (grade) => {
    const members = emptyMembers();
    const state = get();
    if (!persistNext(state, {
      grade,
      members,
      route: [],
      isManualSort: false,
      activeStep: 0,
      bulkText: "",
      currentMapPoints: {},
    })) return;
    set({
      grade,
      mapData: null,
      isLoading: true,
      members,
      draftMemberNames: members.map(() => ""),
      route: [],
      bulkText: "",
      isManualSort: false,
      activeStep: 0,
    });
  },
  mapData: null,
  setMapData: (data) => {
    set({ mapData: data });
    get().recalcRoute();
  },
  isLoading: true,
  setIsLoading: (value) => set({ isLoading: value }),
  members: initialTreasure.members,
  setMember: (memberNo, item) => {
    const state = get();
    const members = [...state.members];
    const draftMemberNames = [...state.draftMemberNames];
    members[memberNo] = item;
    draftMemberNames[memberNo] = "";
    if (state.isManualSort) {
      const route = updateManualRoute(
        state.route,
        members,
        state.mapData,
        item.memberNo,
        state.currentMapPoints,
      );
      if (!persistNext(state, { members, route })) return;
      set({
        members,
        draftMemberNames,
        route,
      });
      return;
    }
    if (!persistNext(state, { members })) return;
    set({ members, draftMemberNames });
    get().recalcRoute();
  },
  removeMember: (memberNo) => {
    const state = get();
    const members = [...state.members];
    const draftMemberNames = [...state.draftMemberNames];
    members[memberNo] = null;
    draftMemberNames[memberNo] = "";
    if (state.isManualSort) {
      const route = updateManualRoute(
        state.route,
        members,
        state.mapData,
        undefined,
        state.currentMapPoints,
      );
      if (!persistNext(state, { members, route })) return;
      set({
        members,
        draftMemberNames,
        route,
      });
      return;
    }
    if (!persistNext(state, { members })) return;
    set({ members, draftMemberNames });
    get().recalcRoute();
  },
  draftMemberNames: initialTreasure.members.map(() => ""),
  setDraftMemberName: (memberNo, name) => {
    const draftMemberNames = [...get().draftMemberNames];
    draftMemberNames[memberNo] = name;
    set({ draftMemberNames });
  },
  clearDraftMemberName: (memberNo) => {
    const draftMemberNames = [...get().draftMemberNames];
    draftMemberNames[memberNo] = "";
    set({ draftMemberNames });
  },
  clearMembers: () => {
    const state = get();
    const members = emptyMembers();
    if (!persistNext(state, {
      members,
      route: [],
      isManualSort: false,
      activeStep: 0,
      currentMapPoints: {},
    })) return;
    set({
      members,
      draftMemberNames: members.map(() => ""),
      route: [],
      isManualSort: false,
      activeStep: 0,
    });
  },
  clearAllData: () => {
    const state = get();
    const members = emptyMembers();
    if (!persistNext(state, {
      members,
      route: [],
      isManualSort: false,
      activeStep: 0,
      bulkText: "",
      currentMapPoints: {},
    })) return;
    set({
      members,
      draftMemberNames: members.map(() => ""),
      route: [],
      bulkText: "",
      isManualSort: false,
      activeStep: 0,
    });
  },
  route: initialRoute,
  isManualSort: initialManualSort,
  setRoute: (steps) => {
    const state = get();
    const normalized = steps.map((step, index) => ({
      ...step,
      orderNo: index + 1,
    }));
    if (!persistNext(state, { route: normalized, isManualSort: true })) return;
    set({ route: normalized, isManualSort: true });
  },
  setManualSort: (value) => {
    const state = get();
    if (!persistNext(state, { isManualSort: value })) return;
    set({ isManualSort: value });
  },
  activeStep: initialActiveStep,
  setActiveStep: (value) => {
    if (!Number.isInteger(value) || value < 0) return;
    const state = get();
    if (!persistNext(state, { activeStep: value })) return;
    set({ activeStep: value });
  },
  completeStep: (index) => {
    const state = get();
    const route = state.route.map((step, routeIndex) =>
      routeIndex === index ? { ...step, isCompleted: true } : step,
    );
    const nextActive = route.findIndex(
      (step, routeIndex) => routeIndex > index && !step.isCompleted,
    );
    const nextActiveStep = nextActive >= 0 ? nextActive : index;
    const completedStep = route[index];
    if (!completedStep) return;
    const currentMapPoints = {
      ...state.currentMapPoints,
      [completedStep.mapNo]: completedStep.point,
    };
    if (!persistNext(state, { route, activeStep: nextActiveStep, currentMapPoints })) return;
    set({ route, activeStep: nextActiveStep, currentMapPoints });
  },
  uncompleteStep: (index) => {
    const state = get();
    const route = state.route.map((step, routeIndex) =>
      routeIndex === index ? { ...step, isCompleted: false } : step,
    );
    if (!persistNext(state, { route, activeStep: index })) return;
    set({ route, activeStep: index });
  },
  bulkText: initialBulkText,
  setBulkText: (text) => {
    const state = get();
    if (!persistNext(state, { bulkText: text })) return;
    set({ bulkText: text });
  },
  modalMemberNo: null,
  openModal: (memberNo) => set({ modalMemberNo: memberNo }),
  closeModal: () => set({ modalMemberNo: null }),
  currentMapPoints: initialCurrentMapPoints,
  recalcRoute: () => {
    const state = get();
    if (!state.mapData) return;
    const activeMembers = state.members.filter(
      (member): member is UserItem => member !== null,
    );
    if (activeMembers.length === 0) {
      const next = { route: [] as RouteStep[], isManualSort: false, activeStep: 0 };
      if (!persistNext(state, next)) return;
      set(next);
      return;
    }
    const result = calcShortestRoute(
      activeMembers.map((member) => ({
        memberNo: member.memberNo,
        memberName: member.memberName,
        mapNo: member.mapNo,
        mapName: member.mapName,
        mapNameShort: member.mapNameShort,
        mapPoint: member.mapPoint,
      })),
      state.mapData.mapData,
      state.currentMapPoints,
    );
    const nextRoute = toRouteSteps(result.orderedSteps);
    if (!persistNext(state, {
      route: nextRoute,
      isManualSort: false,
      activeStep: 0,
    })) return;
    set({
      route: nextRoute,
      isManualSort: false,
      activeStep: 0,
    });
  },
}));

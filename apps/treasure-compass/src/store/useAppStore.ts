import { DEFAULT_GRADE, FULL_PARTY } from "@/constants";
import {
  readPersistedTreasure,
  writePersistedTreasure,
} from "@/persistence/storage";
import type { Grade, MapData, RouteStep, UserItem } from "@/types";
import { calcShortestRoute, toRouteSteps } from "@/utils/distance";
import { create } from "zustand";

const restored = readPersistedTreasure();
const initialTreasure = restored.snapshot ?? {
  grade: DEFAULT_GRADE,
  members: Array<UserItem | null>(FULL_PARTY).fill(null),
};

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
  completeStep: (index: number) => void;
  uncompleteStep: (index: number) => void;
  bulkText: string;
  setBulkText: (text: string) => void;
  modalMemberNo: number | null;
  openModal: (memberNo: number) => void;
  closeModal: () => void;
  recalcRoute: () => void;
}

function persist(grade: Grade, members: (UserItem | null)[]): boolean {
  return writePersistedTreasure({ grade, members });
}

export const useAppStore = create<AppState>((set, get) => ({
  grade: initialTreasure.grade,
  setGrade: (grade) => {
    const state = get();
    if (!persist(grade, state.members)) return;
    set({ grade, mapData: null, isLoading: true });
  },
  setGradeWithReset: (grade) => {
    const members = emptyMembers();
    if (!persist(grade, members)) return;
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
    if (!persist(state.grade, members)) return;
    set({ members, draftMemberNames });
    get().recalcRoute();
  },
  removeMember: (memberNo) => {
    const state = get();
    const members = [...state.members];
    const draftMemberNames = [...state.draftMemberNames];
    members[memberNo] = null;
    draftMemberNames[memberNo] = "";
    if (!persist(state.grade, members)) return;
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
    if (!persist(state.grade, members)) return;
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
    if (!persist(state.grade, members)) return;
    set({
      members,
      draftMemberNames: members.map(() => ""),
      route: [],
      bulkText: "",
      isManualSort: false,
      activeStep: 0,
    });
  },
  route: [],
  isManualSort: false,
  setRoute: (steps) => {
    const state = get();
    const normalized = steps.map((step, index) => ({
      ...step,
      orderNo: index + 1,
    }));
    if (!persist(state.grade, state.members)) return;
    set({ route: normalized, isManualSort: true });
  },
  setManualSort: (value) => set({ isManualSort: value }),
  activeStep: 0,
  setActiveStep: (value) => set({ activeStep: value }),
  completeStep: (index) => {
    const state = get();
    const route = state.route.map((step, routeIndex) =>
      routeIndex === index ? { ...step, isCompleted: true } : step,
    );
    const nextActive = route.findIndex(
      (step, routeIndex) => routeIndex > index && !step.isCompleted,
    );
    if (!persist(state.grade, state.members)) return;
    set({ route, activeStep: nextActive >= 0 ? nextActive : index });
  },
  uncompleteStep: (index) => {
    const state = get();
    const route = state.route.map((step, routeIndex) =>
      routeIndex === index ? { ...step, isCompleted: false } : step,
    );
    if (!persist(state.grade, state.members)) return;
    set({ route, activeStep: index });
  },
  bulkText: "",
  setBulkText: (text) => set({ bulkText: text }),
  modalMemberNo: null,
  openModal: (memberNo) => set({ modalMemberNo: memberNo }),
  closeModal: () => set({ modalMemberNo: null }),
  recalcRoute: () => {
    const state = get();
    if (!state.mapData) return;
    const activeMembers = state.members.filter(
      (member): member is UserItem => member !== null,
    );
    if (activeMembers.length === 0) {
      set({ route: [], isManualSort: false, activeStep: 0 });
      return;
    }
    const result = calcShortestRoute(
      activeMembers.map((member) => ({
        memberName: member.memberName,
        mapNo: member.mapNo,
        mapName: member.mapName,
        mapNameShort: member.mapNameShort,
        mapPoint: member.mapPoint,
      })),
      state.mapData.mapData,
    );
    set({
      route: toRouteSteps(result.orderedSteps),
      isManualSort: false,
      activeStep: 0,
    });
  },
}));

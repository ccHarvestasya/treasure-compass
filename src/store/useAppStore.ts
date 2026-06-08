import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Grade, UserItem, RouteStep, MapData } from "@/types";
import {
  DEFAULT_GRADE,
  FULL_PARTY,
  STORAGE_KEY_GRADE,
  STORAGE_KEY_MEMBERS,
} from "@/constants";
import { calcShortestRoute, toRouteSteps } from "@/utils/distance";

interface AppState {
  // グレード
  grade: Grade;
  setGrade: (grade: Grade) => void;
  setGradeWithReset: (grade: Grade) => void;

  // マップデータ（ロード済み）
  mapData: MapData | null;
  setMapData: (data: MapData | null) => void;

  // ローディング状態
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;

  // メンバー（最大8スロット、nullは空き）
  members: (UserItem | null)[];
  setMember: (memberNo: number, item: UserItem) => void;
  removeMember: (memberNo: number) => void;
  draftMemberNames: string[];
  setDraftMemberName: (memberNo: number, name: string) => void;
  clearDraftMemberName: (memberNo: number) => void;
  clearMembers: () => void;
  clearAllData: () => void;

  // 経路
  route: RouteStep[];
  isManualSort: boolean;
  setRoute: (steps: RouteStep[]) => void;
  setManualSort: (v: boolean) => void;

  // 現在フォーカスしているステップ
  activeStep: number;
  setActiveStep: (n: number) => void;

  // ステップ完了マーク
  completeStep: (index: number) => void;
  uncompleteStep: (index: number) => void;

  // 一括入力テキスト
  bulkText: string;
  setBulkText: (text: string) => void;

  // モーダル: 座標入力中のメンバー番号 (null=閉じている)
  modalMemberNo: number | null;
  openModal: (memberNo: number) => void;
  closeModal: () => void;

  // 経路を再計算
  recalcRoute: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      grade: DEFAULT_GRADE,
      setGrade: (grade) => {
        set({ grade, mapData: null, isLoading: true });
      },
      setGradeWithReset: (grade) => {
        set({
          grade,
          mapData: null,
          isLoading: true,
          members: Array<UserItem | null>(FULL_PARTY).fill(null),
          draftMemberNames: Array<string>(FULL_PARTY).fill(""),
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
      setIsLoading: (v) => set({ isLoading: v }),

      members: Array<UserItem | null>(FULL_PARTY).fill(null),
      setMember: (memberNo, item) => {
        const members = [...get().members];
        const draftMemberNames = [...get().draftMemberNames];
        members[memberNo] = item;
        draftMemberNames[memberNo] = "";
        set({ members, draftMemberNames });
        get().recalcRoute();
      },
      removeMember: (memberNo) => {
        const members = [...get().members];
        const draftMemberNames = [...get().draftMemberNames];
        members[memberNo] = null;
        draftMemberNames[memberNo] = "";
        set({ members, draftMemberNames });
        get().recalcRoute();
      },
      draftMemberNames: Array<string>(FULL_PARTY).fill(""),
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
        set({
          members: Array<UserItem | null>(FULL_PARTY).fill(null),
          draftMemberNames: Array<string>(FULL_PARTY).fill(""),
          route: [],
          isManualSort: false,
          activeStep: 0,
        });
      },
      clearAllData: () => {
        set({
          members: Array<UserItem | null>(FULL_PARTY).fill(null),
          draftMemberNames: Array<string>(FULL_PARTY).fill(""),
          route: [],
          bulkText: "",
          isManualSort: false,
          activeStep: 0,
        });
      },

      route: [],
      isManualSort: false,
      setRoute: (steps) => set({ route: steps, isManualSort: true }),
      setManualSort: (v) => set({ isManualSort: v }),

      activeStep: 0,
      setActiveStep: (n) => set({ activeStep: n }),

      completeStep: (index) => {
        const route = get().route.map((s, i) =>
          i === index ? { ...s, isCompleted: true } : s,
        );
        const nextActive = route.findIndex(
          (s, i) => i > index && !s.isCompleted,
        );
        set({ route, activeStep: nextActive >= 0 ? nextActive : index });
      },

      uncompleteStep: (index) => {
        const route = get().route.map((s, i) =>
          i === index ? { ...s, isCompleted: false } : s,
        );
        set({ route, activeStep: index });
      },

      bulkText: "",
      setBulkText: (text) => set({ bulkText: text }),

      modalMemberNo: null,
      openModal: (memberNo) => set({ modalMemberNo: memberNo }),
      closeModal: () => set({ modalMemberNo: null }),

      recalcRoute: () => {
        const { members, mapData } = get();
        if (!mapData) return;

        const activeMembers = members.filter((m): m is UserItem => m !== null);
        if (activeMembers.length === 0) {
          set({ route: [], isManualSort: false, activeStep: 0 });
          return;
        }

        const result = calcShortestRoute(
          activeMembers.map((m) => ({
            memberName: m.memberName,
            mapNo: m.mapNo,
            mapName: m.mapName,
            mapNameShort: m.mapNameShort,
            mapPoint: m.mapPoint,
          })),
          mapData.mapData,
        );
        set({
          route: toRouteSteps(result.orderedSteps),
          isManualSort: false,
          activeStep: 0,
        });
      },
    }),
    {
      name: "treasure-compass-store",
      partialize: (state) => ({
        grade: state.grade,
        members: state.members,
      }),
      storage: {
        getItem: (key) => {
          const gradeRaw = localStorage.getItem(STORAGE_KEY_GRADE);
          const membersRaw = localStorage.getItem(STORAGE_KEY_MEMBERS);
          if (key === "treasure-compass-store") {
            try {
              const grade = gradeRaw
                ? (JSON.parse(gradeRaw) as Grade)
                : DEFAULT_GRADE;
              const members = membersRaw
                ? (JSON.parse(membersRaw) as (UserItem | null)[])
                : Array<UserItem | null>(FULL_PARTY).fill(null);
              return { state: { grade, members }, version: 0 };
            } catch {
              return null;
            }
          }
          return null;
        },
        setItem: (_, value) => {
          const v = value as {
            state: { grade: Grade; members: (UserItem | null)[] };
          };
          localStorage.setItem(
            STORAGE_KEY_GRADE,
            JSON.stringify(v.state.grade),
          );
          localStorage.setItem(
            STORAGE_KEY_MEMBERS,
            JSON.stringify(v.state.members),
          );
        },
        removeItem: () => {
          localStorage.removeItem(STORAGE_KEY_GRADE);
          localStorage.removeItem(STORAGE_KEY_MEMBERS);
        },
      },
    },
  ),
);

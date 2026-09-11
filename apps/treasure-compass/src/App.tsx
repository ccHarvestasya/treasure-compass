import { ContactDialog } from "@/components/ContactDialog/ContactDialog";
import { GradeSelector } from "@/components/GradeSelector/GradeSelector";
import { LoadingScreen } from "@/components/LoadingScreen/LoadingScreen";
import { MapCanvas } from "@/components/MapCanvas/MapCanvas";
import { PositionModal } from "@/components/PositionModal/PositionModal";
import { SideBar } from "@/components/SideBar/SideBar";
import { SupportDialog } from "@/components/SupportDialog/SupportDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GRADE_LABELS } from "@/constants";
import { useMapData } from "@/hooks/useMapData";
import { useAppStore } from "@/store/useAppStore";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast, Toaster } from "sonner";

function AppContent() {
  useMapData();
  const isLoading = useAppStore((state) => state.isLoading);
  const grade = useAppStore((state) => state.grade);
  const clearAllData = useAppStore((state) => state.clearAllData);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4 shrink-0">
            <span className="text-sky-400 font-bold text-lg tracking-tight">
              Treasure Compass
            </span>
            <span className="text-slate-600 text-sm hidden sm:block">
              FFXIV トレジャーハント
            </span>
          </div>
          <GradeSelector />
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <span className="text-slate-500 text-xs hidden md:block">
              {GRADE_LABELS[grade]}
            </span>
            <ContactDialog />
            <SupportDialog />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsClearConfirmOpen(true)}
              className="text-slate-400 hover:text-red-400 hover:bg-red-950/30 h-8 px-2"
            >
              <Trash2 className="size-3.5 mr-1" />
              <span className="text-xs">クリア</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row max-w-screen-xl mx-auto w-full p-4 gap-4">
        <aside className="w-full lg:w-[420px] xl:w-[460px] shrink-0 flex flex-col bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          <SideBar />
        </aside>
        <section className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 flex-1 flex flex-col">
            <MapCanvas />
          </div>
        </section>
      </main>

      <PositionModal />

      <Dialog open={isClearConfirmOpen} onOpenChange={setIsClearConfirmOpen}>
        <DialogContent className="max-w-sm bg-slate-900 border-slate-700 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-red-300 text-sm">
              データをクリアしますか？
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-xs leading-relaxed">
              メンバー一覧・巡回経路・一括入力テキストを初期化します。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="bg-slate-900/50 border-slate-700">
            <Button
              variant="outline"
              onClick={() => setIsClearConfirmOpen(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              キャンセル
            </Button>
            <Button
              onClick={() => {
                clearAllData();
                setIsClearConfirmOpen(false);
                toast.success("データをクリアしました");
              }}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              クリアする
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function App() {
  return (
    <TooltipProvider>
      <AppContent />
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          classNames: {
            toast: "bg-slate-800 border-slate-700 text-slate-100",
          },
        }}
      />
    </TooltipProvider>
  );
}

import { ContactDialog } from "@/components/ContactDialog/ContactDialog";
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
import { useMapData } from "@/hooks/useMapData";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";
import { toast, Toaster } from "sonner";
import appPackage from "../package.json";

function AppContent() {
  useMapData();
  const isLoading = useAppStore((state) => state.isLoading);
  const mapDataError = useAppStore((state) => state.mapDataError);
  const clearAllData = useAppStore((state) => state.clearAllData);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  if (isLoading) return <LoadingScreen />;

  if (mapDataError) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md rounded-xl border border-red-900/60 bg-slate-900 p-6 text-center">
          <h1 className="text-sm font-semibold text-red-300">読み込みエラー</h1>
          <p className="mt-3 text-sm text-slate-300">{mapDataError}</p>
          <Button className="mt-5 bg-sky-600 hover:bg-sky-500" onClick={() => window.location.reload()}>
            再試行
          </Button>
        </div>
      </div>
    );
  }

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
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <ContactDialog />
            <SupportDialog />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row max-w-screen-xl mx-auto w-full p-4 gap-4">
        <aside className="order-2 w-full shrink-0 flex flex-col bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden lg:order-1 lg:w-[420px] xl:w-[460px]">
          <SideBar onClearRequest={() => setIsClearConfirmOpen(true)} />
        </aside>
        <section className="order-1 flex min-w-0 flex-1 flex-col gap-3 lg:order-2">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 flex-1 flex flex-col">
            <MapCanvas />
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 px-4 py-3 text-center text-xs text-slate-500">
        <span className="hidden sm:inline">
          Treasure Compass v{appPackage.version} · © 2026 Quarry Mill Applied Magitek Technologies
        </span>
        <span className="sm:hidden">
          Treasure Compass v{appPackage.version} · © 2026 QMAMT
        </span>
      </footer>

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
                if (!clearAllData()) {
                  toast.error("保存に失敗したため、データをクリアできませんでした");
                  return;
                }
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

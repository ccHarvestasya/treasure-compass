import { useMapData } from '@/hooks/useMapData';
import { useAppStore } from '@/store/useAppStore';
import { GradeSelector } from '@/components/GradeSelector/GradeSelector';
import { MapCanvas } from '@/components/MapCanvas/MapCanvas';
import { SideBar } from '@/components/SideBar/SideBar';
import { PositionModal } from '@/components/PositionModal/PositionModal';
import { LoadingScreen } from '@/components/LoadingScreen/LoadingScreen';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { GRADE_LABELS } from '@/constants';
import { ContactDialog } from '@/components/ContactDialog/ContactDialog';
import { SupportDialog } from '@/components/SupportDialog/SupportDialog';

function AppContent() {
  useMapData();
  const isLoading = useAppStore(s => s.isLoading);
  const grade = useAppStore(s => s.grade);
  const clearMembers = useAppStore(s => s.clearMembers);

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4 shrink-0">
            <span className="text-sky-400 font-bold text-lg tracking-tight">Treasure Compass</span>
            <span className="text-slate-600 text-sm hidden sm:block">FFXIV トレジャーハント</span>
          </div>
          <GradeSelector />
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <span className="text-slate-500 text-xs hidden md:block">{GRADE_LABELS[grade]}</span>
            <ContactDialog />
            <SupportDialog />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { clearMembers(); toast.success('データをクリアしました'); }}
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
            toast: 'bg-slate-800 border-slate-700 text-slate-100',
          },
        }}
      />
    </TooltipProvider>
  );
}

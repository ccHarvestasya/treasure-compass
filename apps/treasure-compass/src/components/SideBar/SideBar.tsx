import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/useAppStore";
import { ManualEntryTab } from "./ManualEntryTab";
import { BulkInputTab } from "./BulkInputTab";
import { RouteProgressTab } from "./RouteProgressTab";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface SideBarProps {
  readonly onClearRequest: () => void;
}

export function SideBar({ onClearRequest }: SideBarProps) {
  const registrations = useAppStore((state) => state.registrations);
  const [manualRegistrationId, setManualRegistrationId] = useState<string | null | undefined>(undefined);
  const [bulkOpen, setBulkOpen] = useState(false);

  return (
    <div className="flex min-h-0 flex-col h-full">
      <div className="flex items-center gap-2 border-b border-slate-700 p-3">
        <span className="text-xs font-semibold text-slate-200">巡回リスト</span>
        <Badge className="bg-slate-700 text-slate-200">{registrations.length}/8</Badge>
        <div className="ml-auto flex gap-1">
          <Button size="sm" onClick={() => setManualRegistrationId(null)} className="h-8 bg-sky-600 px-2 text-xs hover:bg-sky-500">
            手動登録
          </Button>
          <Button size="sm" variant="outline" onClick={() => setBulkOpen(true)} className="hidden h-8 border-slate-600 px-2 text-xs text-slate-200 hover:bg-slate-800 sm:inline-flex">
            一括入力
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onClearRequest}
            className="h-8 border-slate-600 px-2 text-xs text-slate-300 hover:border-red-900/60 hover:bg-red-950/30 hover:text-red-300"
          >
            <Trash2 className="mr-1 size-3.5" />
            クリア
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <RouteProgressTab onEdit={(registrationId) => setManualRegistrationId(registrationId)} />
      </div>
      <ManualEntryTab
        registrationId={manualRegistrationId}
        open={manualRegistrationId !== undefined}
        onOpenChange={(open) => { if (!open) setManualRegistrationId(undefined); }}
      />
      <BulkInputTab open={bulkOpen} onOpenChange={setBulkOpen} />
    </div>
  );
}

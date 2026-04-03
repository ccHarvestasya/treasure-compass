import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapCanvas } from '@/components/MapCanvas/MapCanvas';
import { useAppStore } from '@/store/useAppStore';
import { DEFAULT_MEMBER_NAME } from '@/constants';
import type { Point } from '@/types';
import { cn } from '@/lib/utils';

export function PositionModal() {
  const modalMemberNo = useAppStore(s => s.modalMemberNo);
  const closeModal = useAppStore(s => s.closeModal);
  const mapData = useAppStore(s => s.mapData);
  const members = useAppStore(s => s.members);
  const setMember = useAppStore(s => s.setMember);

  const [selectedMapNo, setSelectedMapNo] = useState(1);

  const isOpen = modalMemberNo !== null;
  const currentMapItem = mapData?.mapData.find(m => m.mapNo === selectedMapNo);
  const treasurePoints = currentMapItem?.point.filter(p => p.division === 'P') ?? [];

  const handlePointSelect = (point: Point) => {
    if (modalMemberNo === null || !currentMapItem) return;

    const memberName = members[modalMemberNo]?.memberName || DEFAULT_MEMBER_NAME;
    setMember(modalMemberNo, {
      memberNo: modalMemberNo,
      memberName,
      mapNo: currentMapItem.mapNo,
      mapName: currentMapItem.mapName,
      mapNameShort: currentMapItem.mapNameShort,
      mapPoint: point,
    });
    closeModal();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) closeModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl w-full bg-slate-900 border-slate-700 text-slate-100 p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="px-4 pt-4 pb-2 shrink-0">
          <DialogTitle className="text-sky-300 text-sm">
            座標を選択 — スロット {modalMemberNo !== null ? modalMemberNo + 1 : ''}
          </DialogTitle>
        </DialogHeader>

        {/* マップタブ */}
        <div className="flex gap-1 px-4 flex-wrap shrink-0">
          {mapData?.mapData.map(m => (
            <button
              key={m.mapNo}
              onClick={() => setSelectedMapNo(m.mapNo)}
              className={cn(
                'px-2.5 py-1 rounded text-xs font-medium transition-all border',
                selectedMapNo === m.mapNo
                  ? 'bg-sky-600 border-sky-500 text-white'
                  : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700',
              )}
            >
              {m.mapNameShort}
            </button>
          ))}
        </div>

        <div className="flex gap-4 p-4 overflow-auto flex-1 min-h-0">
          {/* キャンバス */}
          <div className="flex-[3] min-w-0">
            <MapCanvas
              interactive
              mapNo={selectedMapNo}
              onPointClick={handlePointSelect}
            />
            <p className="text-xs text-slate-500 mt-1 text-center">
              マップをクリックして座標を選択
            </p>
          </div>

          {/* ボタン一覧 */}
          <div className="flex flex-col gap-1.5 min-w-[150px] max-w-[180px] overflow-y-auto">
            <p className="text-xs text-slate-400 mb-1 shrink-0">ポイント一覧</p>
            {treasurePoints.map(p => (
              <Button
                key={p.pointNo}
                variant="outline"
                size="sm"
                onClick={() => handlePointSelect(p)}
                className="justify-start text-xs h-8 border-slate-600 text-slate-300 hover:bg-sky-900/50 hover:border-sky-600 hover:text-sky-200"
              >
                <span className="font-bold text-sky-400 mr-1.5 w-4 text-center">{p.pointName}</span>
                <span className="text-slate-500 text-[10px] font-mono">
                  ({(p.posX / 10).toFixed(1)}, {(p.posY / 10).toFixed(1)})
                </span>
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { parseBulkInput, findMapByName, findPointByCoord } from '@/utils/bulkParser';
import { BULK_INPUT_DELAY_MS, DEFAULT_MEMBER_NAME } from '@/constants';
import { toast } from 'sonner';

export function BulkInputTab() {
  const [text, setText] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapData = useAppStore(s => s.mapData);
  const setMember = useAppStore(s => s.setMember);
  const clearMembers = useAppStore(s => s.clearMembers);

  const handleRegister = (inputText?: string) => {
    const textToUse = inputText ?? text;
    if (!mapData) {
      toast.error('マップデータが読み込まれていません');
      return;
    }

    const parsed = parseBulkInput(textToUse, mapData.mapData);
    if (parsed.length === 0) {
      toast.warning('解析できるデータが見つかりませんでした');
      return;
    }

    clearMembers();
    let registered = 0;

    for (const p of parsed) {
      if (registered >= 8) break;

      const mapItem = findMapByName(p.mapName, mapData.mapData);
      if (!mapItem) {
        toast.warning(`マップが見つかりません: ${p.mapName}`);
        continue;
      }

      const point = findPointByCoord(p.coordX, p.coordY, mapItem);
      if (!point) {
        toast.warning(`座標が見つかりません: ${p.memberName} (${p.coordX}, ${p.coordY})`);
        continue;
      }

      setMember(registered, {
        memberNo: registered,
        memberName: p.memberName || DEFAULT_MEMBER_NAME,
        mapNo: mapItem.mapNo,
        mapName: mapItem.mapName,
        mapNameShort: mapItem.mapNameShort,
        mapPoint: point,
      });
      registered++;
    }

    toast.success(`${registered}名を登録しました`);
  };

  const handleChange = (value: string) => {
    setText(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (value.trim()) handleRegister(value);
    }, BULK_INPUT_DELAY_MS);
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      <p className="text-xs text-slate-400">
        FFXIVのパーティチャットをそのまま貼り付けてください。
        1.5秒後に自動で解析・登録します。
      </p>
      <Textarea
        value={text}
        onChange={e => handleChange(e.target.value)}
        placeholder={'(★プレイヤー名)  マップ名 (12.3, 45.6)\n...'}
        className="h-[320px] font-mono bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-600 resize-none"
        style={{ fontSize: '11px', whiteSpace: 'nowrap', overflowX: 'auto' }}
      />
      <div className="flex gap-2">
        <Button onClick={handleRegister} className="flex-1 bg-sky-600 hover:bg-sky-500 text-white">
          登録
        </Button>
        <Button
          variant="outline"
          onClick={() => { setText(''); clearMembers(); }}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          クリア
        </Button>
      </div>
    </div>
  );
}

import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FULL_PARTY, DEFAULT_MEMBER_NAME } from '@/constants';
import { X, MapPin } from 'lucide-react';

export function ManualEntryTab() {
  const members = useAppStore(s => s.members);
  const setMember = useAppStore(s => s.setMember);
  const removeMember = useAppStore(s => s.removeMember);
  const openModal = useAppStore(s => s.openModal);

  const handleNameChange = (memberNo: number, name: string) => {
    const current = members[memberNo];
    if (current) {
      setMember(memberNo, { ...current, memberName: name });
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      <p className="text-xs text-slate-400 mb-1">
        各スロットに名前を入力し、<MapPin className="inline size-3" /> で座標を設定してください。
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 text-xs border-b border-slate-700">
              <th className="text-left py-1 px-1 w-6">#</th>
              <th className="text-left py-1 px-1">名前</th>
              <th className="text-left py-1 px-1">座標</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: FULL_PARTY }, (_, i) => {
              const m = members[i];
              return (
                <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <td className="py-1.5 px-1 text-slate-500">{i + 1}</td>
                  <td className="py-1.5 px-1">
                    <Input
                      value={m?.memberName ?? ''}
                      onChange={e => handleNameChange(i, e.target.value)}
                      placeholder={DEFAULT_MEMBER_NAME}
                      className="h-7 text-xs bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-600 w-full"
                    />
                  </td>
                  <td className="py-1.5 px-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openModal(i)}
                      className={`h-7 text-xs px-2 border-slate-600 transition-colors ${
                        m?.mapPoint
                          ? 'text-sky-300 border-sky-700 bg-sky-950/50'
                          : 'text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      <MapPin className="size-3 mr-1" />
                      {m?.mapPoint ? `${m.mapNameShort} ${m.mapPoint.pointName}` : '未設定'}
                    </Button>
                  </td>
                  <td className="py-1.5 px-1">
                    {m && (
                      <button
                        onClick={() => removeMember(i)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Heart, ExternalLink, Gift } from 'lucide-react';

export function SupportDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center h-8 px-3 rounded-md bg-pink-600/20 border border-pink-600/50 text-pink-400 hover:bg-pink-600/30 hover:border-pink-500 hover:text-pink-300 text-xs font-medium transition-all duration-150"
      >
        <Heart className="size-3.5 mr-1 fill-pink-500/60" />
        <span>支援する</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm bg-slate-900 border-slate-700 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-pink-300 text-sm flex items-center gap-2">
              <Heart className="size-4 fill-pink-400 text-pink-400" />
              開発者を支援する
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 text-sm text-slate-300">
            <p className="text-slate-400 text-xs leading-relaxed">
              Treasure Compass の開発・維持にご支援いただけると大変励みになります。
              いただいたご支援は開発継続のために活用させていただきます。
            </p>

            <div className="flex flex-col gap-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">支援方法</p>
              <a
                href="https://www.amazon.co.jp/hz/wishlist/ls/DUWO6N1NXBGV?ref_=wl_share"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-pink-600/50 hover:bg-pink-950/20 transition-all duration-150 group"
              >
                <Gift className="size-4 text-pink-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-200 text-xs">Amazon ほしいものリスト</p>
                  <p className="text-slate-500 text-[11px] truncate">amazon.co.jp</p>
                </div>
                <ExternalLink className="size-3 text-slate-500 group-hover:text-pink-400 transition-colors" />
              </a>
              <a
                href="https://ofuse.me/101d9970"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-pink-600/50 hover:bg-pink-950/20 transition-all duration-150 group"
              >
                <img src="/ofuse-icon-white.svg" alt="OFUSE" className="w-4 h-4 rounded-sm object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-200 text-xs">OFUSE で支援する</p>
                  <p className="text-slate-500 text-[11px] truncate">ofuse.me</p>
                </div>
                <ExternalLink className="size-3 text-slate-500 group-hover:text-pink-400 transition-colors" />
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

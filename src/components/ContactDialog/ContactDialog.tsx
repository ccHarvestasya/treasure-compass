import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageCircle, ExternalLink } from 'lucide-react';

export function ContactDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-slate-400 hover:text-sky-400 hover:bg-sky-950/30 h-8 px-2"
      >
        <MessageCircle className="size-3.5 mr-1" />
        <span className="text-xs hidden sm:inline">バグ報告</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm bg-slate-900 border-slate-700 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-sky-300 text-sm">バグ報告・ご要望</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 text-sm text-slate-300">
            <p>
              バグや要望は X（旧Twitter）の{' '}
              <a
                href="https://x.com/mimosa_sami"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300 inline-flex items-center gap-0.5"
              >
                @mimosa_sami
                <ExternalLink className="size-3" />
              </a>{' '}
              までご報告ください。
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

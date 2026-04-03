import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BulkInputTab } from './BulkInputTab';
import { ManualEntryTab } from './ManualEntryTab';
import { RouteProgressTab } from './RouteProgressTab';
import { useAppStore } from '@/store/useAppStore';
import { Badge } from '@/components/ui/badge';

export function SideBar() {
  const route = useAppStore(s => s.route);
  const members = useAppStore(s => s.members);
  const memberCount = members.filter(Boolean).length;

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="bulk" className="flex flex-col flex-1 min-h-0">
        <TabsList className="w-full grid grid-cols-3 bg-slate-900 border-b border-slate-700 rounded-none h-10 shrink-0">
          <TabsTrigger
            value="bulk"
            className="text-xs text-slate-200 data-[state=active]:bg-sky-600 data-[state=active]:text-white rounded-sm"
          >
            一括入力
          </TabsTrigger>
          <TabsTrigger
            value="manual"
            className="text-xs text-slate-200 data-[state=active]:bg-sky-600 data-[state=active]:text-white rounded-sm relative"
          >
            手動入力
            {memberCount > 0 && (
              <Badge className="ml-1 h-4 text-[10px] px-1 bg-sky-500 text-white">
                {memberCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="route"
            className="text-xs text-slate-200 data-[state=active]:bg-sky-600 data-[state=active]:text-white rounded-sm relative"
          >
            巡回経路
            {route.length > 0 && (
              <Badge className="ml-1 h-4 text-[10px] px-1 bg-emerald-600 text-white">
                {route.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        <div className="flex-1 overflow-y-auto min-h-0">
          <TabsContent value="bulk" className="m-0">
            <BulkInputTab />
          </TabsContent>
          <TabsContent value="manual" className="m-0">
            <ManualEntryTab />
          </TabsContent>
          <TabsContent value="route" className="m-0">
            <RouteProgressTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

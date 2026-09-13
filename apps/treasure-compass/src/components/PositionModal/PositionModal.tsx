import { ManualEntryTab } from '@/components/SideBar/ManualEntryTab';
import { useAppStore } from '@/store/useAppStore';

export function PositionModal() {
  const registrationId = useAppStore((state) => state.modalRegistrationId);
  const isOpen = useAppStore((state) => state.modalMemberNo !== null || state.modalRegistrationId !== null);
  const closeModal = useAppStore((state) => state.closeModal);

  return (
    <ManualEntryTab
      open={isOpen}
      registrationId={registrationId}
      onOpenChange={(open) => {
        if (!open) closeModal();
      }}
    />
  );
}

'use client';
import { Button, Stack } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import auditLogState from '../../_state/audit-log-state';
import { DeveloperPageHeader } from '../../_com/DeveloperPageHeader';
import { AuditLogDrawer } from '../_com/AuditLogDrawer';
import { AuditLogList } from '../_com/AuditLogList';

/** Developer › Log › Log Audit (read-only, append-only). Guard role ada di ../../layout.tsx. */
export default function LogAuditPage() {
  const { loading } = useSnapshot(auditLogState);

  useEffect(() => {
    void auditLogState.load();
    return () => auditLogState.closeDetail();
  }, []);

  return (
    <>
      <DeveloperPageHeader
        title="Log Audit"
        subtitle="Catatan permanen siapa mengubah apa. Tidak bisa dihapus."
        action={
          <Button
            variant="default"
            leftSection={<IconRefresh size={16} />}
            onClick={() => void auditLogState.load()}
            loading={loading}
          >
            Segarkan
          </Button>
        }
      />
      <Stack gap="lg">
        <AuditLogList />
        <AuditLogDrawer />
      </Stack>
    </>
  );
}

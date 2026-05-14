import { useEffect, useState } from 'react';

export type ImportStatus = {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  filename: string;
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  failedRows: number;
  completedAt: string | null;
};

/**
 * Poll an import's status every 2s. Returns the latest snapshot.
 */
export function useImportStatus(importId: string): ImportStatus | null {
  const [data, setData] = useState<ImportStatus | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchStatus() {
      const res = await fetch(`/api/imports/${importId}`);
      if (!res.ok) return;
      const body = (await res.json()) as { import: ImportStatus };
      if (active) setData(body.import);
    }

    fetchStatus();
    setInterval(fetchStatus, 2000);

    return () => {
      active = false;
    };
  }, [importId]);

  return data;
}

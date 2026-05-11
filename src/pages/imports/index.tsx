import { useState } from 'react';
import { ImportDropzone } from '~/components/imports/ImportDropzone';
import { ImportProgress } from '~/components/imports/ImportProgress';
import { ImportErrorsTable } from '~/components/imports/ImportErrorsTable';
import { useImportStatus } from '~/hooks/useImportStatus';

function ImportInProgress({ importId }: { importId: string }) {
  const status = useImportStatus(importId);
  if (!status) return <p className="text-sm text-gray-500">Loading status…</p>;
  return (
    <div className="flex flex-col gap-4">
      <ImportProgress status={status} />
      <ImportErrorsTable importId={importId} />
    </div>
  );
}

export default function ImportsPage() {
  const [currentImportId, setCurrentImportId] = useState<string | null>(null);

  return (
    <main className="mx-auto max-w-3xl p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Import contacts</h1>
      <ImportDropzone onUploaded={setCurrentImportId} />
      {currentImportId && <ImportInProgress importId={currentImportId} />}
    </main>
  );
}

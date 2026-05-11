import type { ImportStatus } from '~/hooks/useImportStatus';

const STATUS_LABEL: Record<ImportStatus['status'], string> = {
  PENDING: 'Queued',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
};

export function ImportProgress({ status }: { status: ImportStatus }) {
  const percent =
    status.totalRows === 0 ? 0 : Math.round((status.processedRows / status.totalRows) * 100);

  return (
    <div className="border rounded p-4 flex flex-col gap-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{status.filename}</span>
        <span className="text-gray-500">{STATUS_LABEL[status.status]}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="text-xs text-gray-500">
        {status.processedRows} / {status.totalRows} rows ({percent}%) — {status.successfulRows} succeeded, {status.failedRows} failed
      </div>
    </div>
  );
}

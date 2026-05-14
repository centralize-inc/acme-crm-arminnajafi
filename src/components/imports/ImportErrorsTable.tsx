import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/Button';

type ImportError = {
  id: string;
  rowNumber: number;
  rowData: unknown;
  errorMessage: string;
  retried: boolean;
};

export function ImportErrorsTable({ importId }: { importId: string }) {
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    fetch(`/api/imports/${importId}/errors`)
      .then((r) => r.json())
      .then((body: { errors: ImportError[] }) => setErrors(body.errors))
      .catch(() => setErrors([]));
  }, [importId]);

  async function handleRetry() {
    setRetrying(true);
    await fetch(`/api/imports/${importId}/retry`, { method: 'POST' });
    setRetrying(false);
  }

  if (errors.length === 0) return null;

  return (
    <div className="border rounded p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">Errors ({errors.length})</h3>
        <Button variant="secondary" onClick={handleRetry} disabled={retrying}>
          {retrying ? 'Retrying…' : 'Retry failed rows'}
        </Button>
      </div>
      <table className="min-w-full text-sm">
        <thead className="text-left text-gray-500">
          <tr>
            <th className="py-2">Row</th>
            <th className="py-2">Error</th>
            <th className="py-2">Data</th>
          </tr>
        </thead>
        <tbody>
          {errors.map((e) => (
            <tr key={e.id} className="border-t">
              <td className="py-2">{e.rowNumber}</td>
              <td className="py-2 text-red-600">{e.errorMessage}</td>
              <td className="py-2 text-gray-500 font-mono text-xs">
                {JSON.stringify(e.rowData)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

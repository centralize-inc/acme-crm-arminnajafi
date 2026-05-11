import { useState } from 'react';
import { Button } from '~/components/ui/Button';

type Props = {
  onUploaded: (importId: string) => void;
};

export function ImportDropzone({ onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/imports', { method: 'POST', body: form });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `Upload failed (${res.status})`);
      }
      const body = (await res.json()) as { import: { id: string } };
      onUploaded(body.import.id);
      setFile(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="border border-dashed border-gray-300 rounded p-6 flex flex-col gap-3 items-start">
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <Button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Uploading…' : 'Upload CSV'}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

'use client';

type Props = {
  postId?: string | null;
};

export default function PreviewDraftButton({ postId }: Props) {
  async function handlePreview() {
    if (!postId) {
      alert('Save the draft first before previewing.');
      return;
    }

    try {
      const res = await fetch(`/api/posts/preview/${postId}`, { method: 'GET', credentials: 'include' });

      if (!res.ok) {
        let msg = `Error ${res.status}: ${res.statusText}`;
        try {
          const json = await res.json();
          if (json.error) msg += `\nServer: ${json.error}`;
          if (json.debugId) msg += `\nID: ${json.debugId}`;
        } catch (e) { /* ignore json parse error */ }

        alert(`Unable to generate preview.\n${msg}`);
        console.error('Preview error response:', res.status, msg);
        return;
      }

      const data = await res.json();
      if (!data.previewPath) {
        alert('Invalid preview response: Missing URL');
        return;
      }

      window.open(data.previewPath, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error(err);
      alert('Preview failed.');
    }
  }

  return (
    <button
      type="button"
      onClick={handlePreview}
      className="px-3 py-1 border rounded text-sm bg-white text-black hover:bg-slate-100 dark:bg-slate-800 dark:text-white hover:dark:bg-slate-700"
    >
      Preview
    </button>
  );
}

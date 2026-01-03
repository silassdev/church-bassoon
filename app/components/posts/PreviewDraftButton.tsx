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
      const res = await fetch(`/api/posts/preview/${postId}`, {
        method: 'POST',
      });

      if (!res.ok) {
        alert('Unable to generate preview.');
        return;
      }

      const data = await res.json();
      if (!data.previewPath) {
        alert('Invalid preview response.');
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
      className="px-3 py-1 border rounded text-sm hover:bg-slate-100"
    >
      Preview
    </button>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

const STORAGE_KEY = 'bulb_notes_v1';

export default function NotePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const [note, setNote] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      const notes = raw ? JSON.parse(raw) : [];
      const found = notes.find((n) => String(n.id) === String(id));
      setNote(found || null);
    } catch (e) {
      setNote(null);
    }
  }, [id]);

  useEffect(() => {
    if (!isSignedIn) {
      navigate('/');
    }
  }, [isSignedIn, navigate]);

  if (!note) {
    return (
      <div className="min-h-screen p-8 bg-black text-white">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="mb-4 text-sm text-gray-300">← Back</button>
          <div className="p-6 bg-white/5 rounded-lg">Note not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-black text-white">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-4 text-sm text-gray-300">← Back</button>
        <div className="p-6 bg-white/5 rounded-lg">
          <h1 className="text-2xl font-semibold mb-2">{note.title}</h1>
          <div className="text-sm text-gray-300 whitespace-pre-wrap">{note.body}</div>
        </div>
      </div>
    </div>
  );
}

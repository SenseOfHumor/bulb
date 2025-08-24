import React, { useEffect, useState } from 'react';
import { useAuth, UserButton } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { isSignedIn } = useAuth();
  const STORAGE_KEY = 'bulb_notes_v1';
  const navigate = useNavigate();

  const [notes, setNotes] = useState(() => {
    // load from sessionStorage if available, otherwise seed demo notes
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      // ignore
    }
    return [
      { id: Date.now() - 2000, title: 'Welcome to BULB', body: 'This is a temporary note. Create, edit, and delete notes here. These are cleared on sign out.' },
      { id: Date.now() - 1000, title: 'Tips', body: 'Use the + button to add notes. This is a demo-only in-memory store.' },
    ];
  });
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', body: '' });

  useEffect(() => {
    if (!isSignedIn) {
      // clear notes when signed out
      setNotes([]);
      try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) {}
    }
  }, [isSignedIn]);

  // persist to sessionStorage when notes change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {}
  }, [notes]);

  function createNote() {
    const n = { id: Date.now(), title: 'Untitled', body: '' };
    setNotes((s) => [n, ...s]);
    setEditing(n.id);
    setForm({ title: n.title, body: n.body });
  }

  function saveNote(id) {
    setNotes((s) => s.map((n) => (n.id === id ? { ...n, title: form.title, body: form.body } : n)));
    setEditing(null);
  }

  function deleteNote(id) {
    setNotes((s) => s.filter((n) => n.id !== id));
  }

  return (
    <div className="min-h-screen p-8 bg-black text-white text-left">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="text-sm text-gray-300">Your quick notes (temporary in-memory mock)</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={createNote}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white/6 hover:bg-white/10 rounded-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              <span className="text-sm">New Note</span>
            </button>
            <UserButton />
          </div>
        </header>

        <main>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {notes.length === 0 && (
              <div className="p-6 bg-white/3 rounded-lg text-left text-gray-300">
                No notes yet. Click "New Note" to start.
              </div>
            )}

            {notes.map((note) => (
              <div
                key={note.id}
                className="p-4 bg-white/5 rounded-lg border border-white/6 text-left cursor-pointer"
                onClick={(e) => {
                  // don't navigate when interacting with buttons or form controls
                  if (editing === note.id) return;
                  try {
                    if (e.target && e.target.closest && e.target.closest('button, input, textarea')) return;
                  } catch (err) {}
                  navigate(`/note/${note.id}`);
                }}
              >
                {editing === note.id ? (
                  <div className="space-y-3">
                    <input
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      className="w-full p-2 bg-transparent border-b border-white/10"
                      placeholder="Title"
                    />
                    <textarea
                      value={form.body}
                      onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                      className="w-full p-2 bg-transparent border border-white/6 rounded-md h-32"
                      placeholder="Body"
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditing(null)} className="px-3 py-1 rounded-md bg-white/6">Cancel</button>
                      <button onClick={() => saveNote(note.id)} className="px-3 py-1 rounded-md bg-white text-black font-semibold">Save</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-lg text-left">{note.title}</h3>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditing(note.id); setForm({ title: note.title, body: note.body }); }} className="p-1 rounded-md bg-white/6">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" /></svg>
                        </button>
                        <button onClick={() => deleteNote(note.id)} className="p-1 rounded-md bg-white/6">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22" /></svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mt-2">{note.body || <span className="text-gray-500">(no content)</span>}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

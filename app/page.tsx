"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Todo = { id: string; _id?: string; text: string; done: boolean; createdAt?: string };

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const editRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editingId != null) editRef.current?.focus();
  }, [editingId]);

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users/router');
      const json = await res.json();
      if (json && json.ok) {
        const items: Todo[] = json.todos.map((t: Todo) => ({ id: t._id, _id: t._id, text: t.text, done: !!t.done, createdAt: t.createdAt }));
        setTodos(items);
      } else if (json && json.retryable) {
        // Retry after a delay for retryable errors
        setTimeout(() => fetchTodos(), 2000);
      }
    } catch (err) {
      console.error('fetchTodos error', err);
      // Retry after a delay for network errors
      setTimeout(() => fetchTodos(), 3000);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = useCallback(async () => {
    const text = value.trim();
    if (!text) return;
    try {
      const res = await fetch('/api/users/router', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
      const json = await res.json();
      if (json && json.ok) {
        const t = json.todo;
        setTodos((s) => [{ id: t._id, _id: t._id, text: t.text, done: !!t.done, createdAt: t.createdAt }, ...s]);
        setValue('');
      } else if (json && json.retryable) {
        // Retry after delay
        setTimeout(() => addTodo(), 2000);
      }
    } catch (err) {
      console.error('addTodo error', err);
      // Retry after delay
      setTimeout(() => addTodo(), 3000);
    }
  }, [value]);

  const toggle = useCallback(async (id: string) => {
    const current = todos.find((t) => t.id === id);
    if (!current) return;
    try {
      const res = await fetch('/api/users/router', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, done: !current.done }) });
      const json = await res.json();
      if (json && json.ok) {
        setTodos((t) => t.map((x) => (x.id === id ? { ...x, done: !!json.todo.done } : x)));
      } else if (json && json.retryable) {
        // Retry after delay
        setTimeout(() => toggle(id), 2000);
      }
    } catch (err) {
      console.error('toggle error', err);
      // Retry after delay
      setTimeout(() => toggle(id), 3000);
    }
  }, [todos]);

  const remove = useCallback(async (id: string) => {
    try {
      const res = await fetch('/api/users/router?id=' + encodeURIComponent(id), { method: 'DELETE' });
      const json = await res.json();
      if (json && json.ok) {
        setTodos((t) => t.filter((x) => x.id !== id));
      } else if (json && json.retryable) {
        // Retry after delay
        setTimeout(() => remove(id), 2000);
      }
    } catch (err) {
      console.error('delete error', err);
      // Retry after delay
      setTimeout(() => remove(id), 3000);
    }
  }, []);

  const startEdit = useCallback((id: string) => {
    setEditingId(id);
  }, []);

  const saveEdit = useCallback(async (id: string, text: string) => {
    try {
      const res = await fetch('/api/users/router', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, text }) });
      const json = await res.json();
      if (json && json.ok) {
        setTodos((t) => t.map((x) => (x.id === id ? { ...x, text: json.todo.text } : x)));
      } else if (json && json.retryable) {
        // Retry after delay
        setTimeout(() => saveEdit(id, text), 2000);
      }
    } catch (err) {
      console.error('saveEdit error', err);
      // Retry after delay
      setTimeout(() => saveEdit(id, text), 3000);
    } finally {
      setEditingId(null);
    }
  }, []);

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>Todos</h1>
        </header>

        <section style={styles.card}>
          <div style={styles.inputRow}>
            <input
              aria-label="New task"
              placeholder="Add a task — press Enter or click Add"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addTodo();
              }}
              style={styles.input}
            />
            <button style={styles.addBtn} onClick={addTodo} aria-label="Add task">
              Add
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Task</th>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={4} style={styles.empty}>Loading…</td>
                  </tr>
                )}
                {!loading && todos.length === 0 && (
                  <tr>
                    <td colSpan={4} style={styles.empty}>All clear — add your first todo ✨</td>
                  </tr>
                )}
                {todos.map((todo) => (
                  <tr key={todo.id} style={styles.row}>
                    <td style={styles.td} onDoubleClick={() => startEdit(todo.id)}>
                      {editingId === todo.id ? (
                        <input
                          ref={editRef}
                          defaultValue={todo.text}
                          onBlur={(e) => saveEdit(todo.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(todo.id, (e.target as HTMLInputElement).value);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          style={styles.editInput}
                        />
                      ) : (
                        <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>{todo.text}</span>
                      )}
                    </td>
                    <td style={styles.td}>{todo.createdAt ? new Date(todo.createdAt).toLocaleDateString() : '-'}</td>
                    <td style={styles.td}>
                      <input type="checkbox" checked={todo.done} onChange={() => toggle(todo.id)} />
                    </td>
                    <td style={styles.td}>
                      <button onClick={() => startEdit(todo.id)} style={styles.iconBtn}>Edit</button>
                      <button onClick={() => remove(todo.id)} style={styles.deleteBtn}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

       
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(180deg,#0f172a 0%, #071024 40%)",
    padding: "56px 20px",
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue'",
  },
  container: {
    width: "100%",
    maxWidth: 920,
    color: "#0f172a",
  },
  header: { textAlign: "center", marginBottom: 22, color: "#f8fafc" },
  title: { margin: 0, fontSize: 42, fontWeight: 700, letterSpacing: "-0.02em" },
  subtitle: { margin: "8px 0 0", opacity: 0.9, color: "#cbd5e1" },
  card: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
    borderRadius: 14,
    padding: 22,
    boxShadow: "0 8px 30px rgba(2,6,23,0.6)",
    backdropFilter: "blur(6px)",
    border: "1px solid rgba(255,255,255,0.04)",
  },
  inputRow: { display: "flex", gap: 12, marginBottom: 12 },
  input: {
    flex: 1,
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.06)",
    outline: "none",
    fontSize: 16,
    background: "rgba(255,255,255,0.96)",
    boxShadow: "inset 0 1px 2px rgba(2,6,23,0.04)",
  },
  addBtn: {
    minWidth: 84,
    padding: "10px 14px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(90deg,#06b6d4,#7c3aed)",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(124,58,237,0.18)",
  },
  list: { listStyle: "none", margin: 0, padding: 0, maxHeight: 420, overflow: "auto" },
  item: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 14px",
    borderRadius: 10,
    marginBottom: 10,
    background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
    transition: "transform .14s ease, opacity .12s ease, box-shadow .14s ease",
    boxShadow: "0 4px 14px rgba(2,6,23,0.16)",
  },
  itemLeft: { width: 28, display: "flex", alignItems: "center", justifyContent: "center" },
  checkbox: { width: 18, height: 18, cursor: "pointer" },
  content: { flex: 1, minWidth: 0 },
  text: { display: "block", fontSize: 16, color: "#e6eef8", lineHeight: 1.4 },
  editInput: { width: "100%", padding: "8px 10px", borderRadius: 8, border: "none" },
  actions: { display: "flex", gap: 8 },
  iconBtn: { background: "transparent", border: "none", color: "#cbd5e1", cursor: "pointer", padding: 6, borderRadius: 8 },
  deleteBtn: { background: "transparent", border: "none", color: "#ffb4b4", cursor: "pointer", padding: 6, borderRadius: 8 },
  empty: { padding: 20, textAlign: "center", color: "#e6eef6" },
  footer: { marginTop: 14, textAlign: "center", color: "#cbd5e1", opacity: 0.9, fontSize: 13 },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 640 },
  th: { textAlign: 'left', padding: '10px 12px', color: '#94a3b8', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.04)' },
  td: { padding: '10px 12px', verticalAlign: 'middle', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#e6eef8' },
  row: { background: 'transparent' },
};

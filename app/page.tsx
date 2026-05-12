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
      }
    } catch (err) {
      console.error('fetchTodos error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setTimeout(fetchTodos, 0);
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
      }
    } catch (err) {
      console.error('addTodo error', err);
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
      }
    } catch (err) {
      console.error('toggle error', err);
    }
  }, [todos]);

  const remove = useCallback(async (id: string) => {
    try {
      const res = await fetch('/api/users/router?id=' + encodeURIComponent(id), { method: 'DELETE' });
      const json = await res.json();
      if (json && json.ok) {
        setTodos((t) => t.filter((x) => x.id !== id));
      }
    } catch (err) {
      console.error('delete error', err);
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
      }
    } catch (err) {
      console.error('saveEdit error', err);
    } finally {
      setEditingId(null);
    }
  }, []);

  return (
    <main style={styles.page}>
      {/* Decorative background elements */}
      <div style={styles.glow1}></div>
      <div style={styles.glow2}></div>

      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>Task Mastery</h1>
          <p style={styles.subtitle}>Streamline your day with precision</p>
        </header>

        <section style={styles.card}>
          <div style={styles.inputRow}>
            <input
              aria-label="New task"
              placeholder="What needs to be done?"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addTodo();
              }}
              style={styles.input}
              suppressHydrationWarning
            />
            <button style={styles.addBtn} onClick={addTodo} aria-label="Add task" suppressHydrationWarning>
              Add Task
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Task Description</th>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={4} style={styles.empty}>
                      <div className="animate-pulse">Loading workspace...</div>
                    </td>
                  </tr>
                )}
                {!loading && todos.length === 0 && (
                  <tr>
                    <td colSpan={4} style={styles.empty}>
                      <div style={{ opacity: 0.6, fontSize: '0.9rem' }}>
                        No active tasks. Start by adding one above.
                      </div>
                    </td>
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
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '10px',
                          textDecoration: todo.done ? 'line-through' : 'none',
                          color: todo.done ? 'rgba(255,255,255,0.4)' : '#fff'
                        }}>
                          <div style={{
                            width: '4px',
                            height: '16px',
                            background: todo.done ? 'rgba(255,255,255,0.1)' : 'linear-gradient(#7c3aed, #ec4899)',
                            borderRadius: '2px'
                          }}></div>
                          {todo.text}
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                        {todo.createdAt ? new Date(todo.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={todo.done} 
                          onChange={() => toggle(todo.id)} 
                          style={styles.checkbox}
                        />
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => startEdit(todo.id)} style={styles.iconBtn}>Edit</button>
                        <button onClick={() => remove(todo.id)} style={styles.deleteBtn}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer style={styles.footer}>
          &copy; {new Date().getFullYear()} TodoApp &bull; Orchestrated via Kubernetes
        </footer>
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
    background: "#020617",
    padding: "40px 20px",
    fontFamily: "'Inter', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  glow1: {
    position: "absolute",
    top: "-10%",
    left: "-10%",
    width: "40%",
    height: "40%",
    background: "radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)",
    zIndex: 0,
  },
  glow2: {
    position: "absolute",
    bottom: "-10%",
    right: "-10%",
    width: "50%",
    height: "50%",
    background: "radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)",
    zIndex: 0,
  },
  container: {
    width: "100%",
    maxWidth: "800px",
    zIndex: 1,
  },
  header: { textAlign: "center", marginBottom: "40px" },
  title: { 
    margin: 0, 
    fontSize: "3.5rem", 
    fontWeight: 800, 
    letterSpacing: "-0.05em",
    background: "linear-gradient(to right, #fff, #94a3b8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: { 
    margin: "10px 0 0", 
    fontSize: "1.1rem", 
    color: "#94a3b8",
    fontWeight: 400 
  },
  card: {
    background: "rgba(15, 23, 42, 0.6)",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
  inputRow: { display: "flex", gap: "12px", marginBottom: "32px" },
  input: {
    flex: 1,
    padding: "16px 20px",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    outline: "none",
    fontSize: "1rem",
    background: "rgba(2, 6, 23, 0.4)",
    color: "#fff",
    transition: "all 0.2s ease",
  },
  addBtn: {
    padding: "0 28px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
    color: "#fff",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' },
  th: { 
    textAlign: 'left', 
    padding: '0 16px 12px', 
    color: '#64748b', 
    fontSize: '0.75rem', 
    textTransform: 'uppercase', 
    letterSpacing: '0.05em' 
  },
  td: { 
    padding: '16px', 
    verticalAlign: 'middle', 
    background: 'rgba(255, 255, 255, 0.03)',
    color: '#f1f5f9',
  },
  row: { 
    transition: 'transform 0.2s ease',
  },
  checkbox: { 
    width: '20px', 
    height: '20px', 
    cursor: 'pointer',
    accentColor: '#7c3aed',
  },
  editInput: { 
    width: "100%", 
    padding: "10px 14px", 
    borderRadius: "12px", 
    border: "1px solid #7c3aed",
    background: "#020617",
    color: "#fff",
    outline: "none"
  },
  iconBtn: { 
    background: "rgba(255, 255, 255, 0.05)", 
    border: "none", 
    color: "#94a3b8", 
    cursor: "pointer", 
    padding: "8px 12px", 
    borderRadius: "10px",
    fontSize: "0.85rem",
    transition: "all 0.2s"
  },
  deleteBtn: { 
    background: "rgba(239, 68, 68, 0.1)", 
    border: "none", 
    color: "#f87171", 
    cursor: "pointer", 
    padding: "8px 12px", 
    borderRadius: "10px",
    fontSize: "0.85rem",
    transition: "all 0.2s"
  },
  empty: { padding: "40px", textAlign: "center", color: "#64748b" },
  footer: { 
    marginTop: "32px", 
    textAlign: "center", 
    color: "#475569", 
    fontSize: "0.85rem",
    letterSpacing: "0.02em"
  },
};

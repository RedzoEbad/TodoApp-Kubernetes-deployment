import { NextResponse } from 'next/server';

async function loadModules() {
  const dbMod = await import('../../../../lib/mongoose');
  const todoMod = await import('../../../../models/Todo');

  const db = dbMod.dbConnect ?? dbMod.default?.dbConnect ?? dbMod.default;
  const Todo = todoMod.default ?? todoMod;

  return { dbConnect: db, Todo };
}

export async function GET() {
  try {
    const { dbConnect, Todo } = await loadModules();
    await dbConnect();
    const todos = await Todo.find().sort({ createdAt: -1 }).limit(200).lean();
    return NextResponse.json({ ok: true, todos });
  } catch (err) {
    console.error('GET /api/users/router error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { dbConnect, Todo } = await loadModules();
    await dbConnect();
    const body = await req.json();
    const { text, owner } = body || {};
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid `text`' }, { status: 400 });
    }
    const todo = await Todo.create({ text: text.trim(), owner: owner || undefined });
    return NextResponse.json({ ok: true, todo }, { status: 201 });
  } catch (err) {
    console.error('POST /api/users/router error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { dbConnect, Todo } = await loadModules();
    await dbConnect();
    const body = await req.json();
    const { id, ...patch } = body || {};
    if (!id) return NextResponse.json({ error: 'Missing `id`' }, { status: 400 });
    const allowed = {};
    if (typeof patch.text === 'string') allowed.text = patch.text.trim();
    if (typeof patch.done === 'boolean') allowed.done = patch.done;
    const updated = await Todo.findByIdAndUpdate(id, { $set: allowed }, { new: true }).lean();
    if (!updated) return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    return NextResponse.json({ ok: true, todo: updated });
  } catch (err) {
    console.error('PATCH /api/users/router error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { dbConnect, Todo } = await loadModules();
    await dbConnect();
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    let bodyId = null;
    try {
      const body = await req.json();
      bodyId = body && body.id;
    } catch (e) {
      /* ignore empty body */
    }
    const useId = id || bodyId;
    if (!useId) return NextResponse.json({ error: 'Missing `id`' }, { status: 400 });
    const deleted = await Todo.findByIdAndDelete(useId);
    if (!deleted) return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    return NextResponse.json({ ok: true, deleted });
  } catch (err) {
    console.error('DELETE /api/users/router error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

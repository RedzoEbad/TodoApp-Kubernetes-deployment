import { dbConnect } from '../../../lib/mongoose.js';
import Todo from '../../../models/Todo.js';

export default async function handler(req, res) {
	try {
		// Add timeout to the database connection
		const connectionPromise = dbConnect();
		const timeoutPromise = new Promise((_, reject) => 
			setTimeout(() => reject(new Error('Database connection timeout')), 15000)
		);
		
		await Promise.race([connectionPromise, timeoutPromise]);

		if (req.method === 'GET') {
			const todos = await Todo.find().sort({ createdAt: -1 }).limit(100).lean();
			return res.status(200).json({ ok: true, todos });
		}

		if (req.method === 'POST') {
			const { text, owner } = req.body || {};
			if (!text || typeof text !== 'string') {
				return res.status(400).json({ error: 'Missing or invalid `text` in request body' });
			}

			const todo = await Todo.create({ text: text.trim(), owner: owner || undefined });
			return res.status(201).json({ ok: true, todo });
		}

		if (req.method === 'PATCH') {
			const { id, ...patch } = req.body || {};
			if (!id) return res.status(400).json({ error: 'Missing `id` in request body' });
			const allowed = {};
			if (typeof patch.text === 'string') allowed.text = patch.text.trim();
			if (typeof patch.done === 'boolean') allowed.done = patch.done;

			const updated = await Todo.findByIdAndUpdate(id, { $set: allowed }, { new: true }).lean();
			if (!updated) return res.status(404).json({ error: 'Todo not found' });
			return res.status(200).json({ ok: true, todo: updated });
		}

		if (req.method === 'DELETE') {
			const id = (req.query && req.query.id) || (req.body && req.body.id);
			if (!id) {
				return res.status(400).json({ error: 'Missing `id` for deletion' });
			}

			const deleted = await Todo.findByIdAndDelete(id);
			if (!deleted) return res.status(404).json({ error: 'Todo not found' });
			return res.status(200).json({ ok: true, deleted });
		}

		res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	} catch (err) {
		console.error('API router error:', err);
		
		// If it's a database connection error, return a more specific message
		if (err.message && err.message.includes('timeout')) {
			return res.status(503).json({ 
				error: 'Database connection timeout. Please try again.',
				retryable: true 
			});
		}
		
		if (err.message && err.message.includes('Database connection failed')) {
			return res.status(503).json({ 
				error: 'Database connection failed. Please try again.',
				retryable: true 
			});
		}
		
		return res.status(500).json({ error: 'Internal server error' });
	}
};


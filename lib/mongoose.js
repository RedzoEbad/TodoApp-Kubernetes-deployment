const mongoose = require("mongoose");

// Accept either `MONGODB` (our code) or the common `MONGODB_URI` env var
const MONGODB_URI = process.env.MONGODB || process.env.MONGODB_URI;

if (!MONGODB_URI) {
	throw new Error("Please define the MONGODB connection string in the environment (MONGODB or MONGODB_URI).");
}

let cached = global.mongoose;

if (!cached) {
	cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		const opts = {
			bufferCommands: false,
		};

		cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
			return mongooseInstance;
		});
	}

	cached.conn = await cached.promise;
	return cached.conn;
}

module.exports = { dbConnect, mongoose };

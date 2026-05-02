import mongoose from 'mongoose';

const TodoSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    done: { type: Boolean, default: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  },
  { timestamps: true }
);

// Avoid model overwrite issues during hot-reload / serverless function re-invocations
export default mongoose.models && mongoose.models.Todo
  ? mongoose.models.Todo
  : mongoose.model('Todo', TodoSchema);

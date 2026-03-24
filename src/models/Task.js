import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Module",
    required: true
  },
  type: {
    type: String, // UI | UX | Backend | Testing | Deployment
    required: true
  },
  status: {
    type: String,
    enum: ["completed", "progress", "pending"],
    default: "pending"
  }
});

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);

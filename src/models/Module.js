import mongoose from "mongoose";

const ModuleSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  progress: {
    type: Number,
    default: 0
  }
});

export default mongoose.models.Module || mongoose.model("Module", ModuleSchema);

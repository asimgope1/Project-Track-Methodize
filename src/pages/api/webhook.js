import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  await connectDB();

  const payload = req.body;

  if (payload.commits) {
    for (const commit of payload.commits) {
      const message = commit.message.toLowerCase();

      // Example parsing logic: "feat: login ui done"
      if (message.includes("login") && message.includes("ui")) {
        // Find a task related to "Login" and "UI", but since we need module ID, 
        // in reality you would parse out the module name or match differently.
        // For MVP, if it matches UI, update the UI task for a mock module.
        // In a real scenario, you would look up the module ID by name.
        
        await Task.findOneAndUpdate(
          { type: "UI" }, // Add module query here ideally
          { status: "completed" },
          { new: true }
        );
      }
    }
  }

  res.status(200).json({ success: true });
}

import { connectDB } from "../../lib/mongodb";
import Module from "../../models/Module";
import Task from "../../models/Task";
import Project from "../../models/Project";

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch(e) {
    return res.status(500).json({ error: "DB connection failed", message: e.message });
  }

  if (req.method === "POST") {
    try {
      let project = await Project.findOne();
      if (!project) {
        project = await Project.create({ name: "CRM System", clientId: "123" });
      }

      const module = await Module.create({
        projectId: project._id,
        name: req.body.name || "Untitled Module",
      });

      const defaultTypes = ["UI", "UX", "Backend", "Testing", "Deploy"];
      await Promise.all(
        defaultTypes.map(type => Task.create({
          moduleId: module._id,
          type: type,
          status: "pending"
        }))
      );

      return res.status(201).json({ success: true, module });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  if (req.method === "GET") {
    try {
      const modules = await Module.find({}).lean();
      const allTasks = await Task.find({}).lean();

      const result = modules.map(mod => {
        const modTasks = allTasks.filter(t => t.moduleId.toString() === mod._id.toString());
        
        const taskMap = {};
        modTasks.forEach(t => { taskMap[t.type] = t.status; });
        
        return {
          id: mod._id,
          name: mod.name,
          tasks: {
            "UI": taskMap["UI"] || "pending",
            "UX": taskMap["UX"] || "pending",
            "Backend": taskMap["Backend"] || "pending",
            "Testing": taskMap["Testing"] || "pending",
            "Deploy": taskMap["Deploy"] || "pending",
          }
        };
      });

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ success: false, error: error.message });
    }
  }
}

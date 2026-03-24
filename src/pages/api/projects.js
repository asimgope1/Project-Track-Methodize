import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "POST") {
    try {
      const project = await Project.create(req.body);
      return res.status(201).json(project);
    } catch (error) {
      return res.status(400).json({ success: false });
    }
  }

  if (req.method === "GET") {
    try {
      const projects = await Project.find({});
      return res.status(200).json(projects);
    } catch (error) {
      return res.status(400).json({ success: false });
    }
  }
}

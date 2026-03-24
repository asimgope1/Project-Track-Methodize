export default async function handler(req, res) {
  const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

  if (!SCRIPT_URL) {
    return res.status(500).json({ error: "GOOGLE_SCRIPT_URL is not set." });
  }

  if (req.method === "POST") {
    try {
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" }, // Apps Script expects plain or form data
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  if (req.method === "GET") {
    try {
      // Fetch modules from Google Sheets Web App
      const response = await fetch(SCRIPT_URL);
      const data = await response.json();
      
      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ success: false, error: error.message });
    }
  }
}

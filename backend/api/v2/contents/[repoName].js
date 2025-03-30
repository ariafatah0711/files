// import { token, username } from "../config.js";
import { token, username } from "../../config.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { repoName } = req.query;
  const path = req.query.path || ""; // Ambil dari query string

  if (req.method === "GET") {
    try {
      const cleanedPath = path.split(",").join("/");
      const url = `https://api.github.com/repos/arialinux/${repoName}/contents/${cleanedPath}`;

      console.log(`📥 Mengambil konten dari: ${url}`);

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Gagal mengambil konten repo");

      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

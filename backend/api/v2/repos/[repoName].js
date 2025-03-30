import { token, username } from "../../config.js";

export default async function handler(req, res) {
  // ✅ Tambahkan CORS Headers di semua response
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // ✅ Tangani Preflight Request (OPTIONS)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { repoName } = req.query;

  if (!repoName) {
    return res.status(400).json({ error: "repoName diperlukan" });
  }

  if (!token) {
    return res.status(500).json({ error: "GITHUB_TOKEN tidak ditemukan" });
  }

  if (req.method === "DELETE") {
    try {
      console.log(`Menghapus repo: ${repoName}`);

      const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error saat menghapus repo:", errorData);
        return res.status(500).json({ error: "Gagal menghapus repository", details: errorData });
      }

      console.log(`✅ Repo ${repoName} berhasil dihapus!`);
      return res.status(200).json({ message: `Repo ${repoName} berhasil dihapus` });
    } catch (error) {
      console.error("Delete Repo Error:", error);
      return res.status(500).json({ error: "Server error", details: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

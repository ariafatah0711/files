import { token, username } from "../../config.js";

export default async function handler(req, res) {
  // ✅ Izinkan CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // ✅ **Tangani Preflight Request (OPTIONS)**
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (!token) {
    return res.status(500).json({ message: "GITHUB_TOKEN tidak ditemukan" });
  }

  if (req.method === "GET") {
    try {
      console.log("GET");
      const response = await fetch("https://api.github.com/user/repos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Gagal mengambil repository");

      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "POST") {
    console.log("POST");
    const { repoName } = req.body;
    const response = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: repoName,
        private: false,
        description: `Repo ${repoName} dibuat dari Next.js`,
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json(data);
    return res.status(201).json(data);
  }

  //   if (req.method === "DELETE") {
  //     console.log("DELETE");
  //     console.log("Menerima DELETE request:", req.query);

  //     const repoName = req.query.repoName || req.body?.repoName;
  //     // const { repoName } = req.query;

  //     if (!repoName) {
  //       return res.status(400).json({ message: "repoName diperlukan" });
  //     }

  //     try {
  //       const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
  //         method: "DELETE",
  //         headers: { Authorization: `Bearer ${token}` },
  //       });

  //       if (!response.ok) {
  //         const errorData = await response.json();
  //         console.log("Error Delete Repo:", errorData);
  //         return res.status(500).json({ message: "Gagal menghapus repository", error: errorData });
  //       }

  //       return res.status(204).end();
  //     } catch (error) {
  //       console.log("Delete Repo Error:", error);
  //       return res.status(500).json({ message: "Server error", error: error.message });
  //     }
  //   }

  return res.status(405).json({ message: "Method Not Allowed" });
}

// import { token, username } from "../config.js";
import { token, username } from "../../config.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { repoName, path } = req.body;

  if (!repoName || !path) {
    return res.status(400).json({ error: "Repo name dan path diperlukan" });
  }

  const url = `https://api.github.com/repos/arialinux/${repoName}/contents/${path}`;

  try {
    console.log(`🔍 Mengecek file/folder: ${url}`);
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    console.log("📄 Data file:", data);

    if (Array.isArray(data)) {
      // 📁 Jika data adalah array, berarti ini folder yang masih ada isinya
      console.log(`🗑️ Folder ${path} masih berisi ${data.length} file. Menghapus semua isinya...`);
      for (const file of data) {
        const deleteFileUrl = `https://api.github.com/repos/arialinux/${repoName}/contents/${file.path}`;
        console.log(`❌ Menghapus file: ${file.path}`);

        await fetch(deleteFileUrl, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `Delete ${file.path}`,
            sha: file.sha,
            branch: "main",
          }),
        });
      }
      console.log(`✅ Semua isi folder ${path} telah dihapus.`);

      // 🔄 Setelah file dihapus, tidak perlu menghapus folder karena sudah dianggap tidak ada oleh GitHub
      return res.status(200).json({ message: `Folder ${path} telah dihapus (otomatis setelah kosong)` });
    }

    // 📌 Jika bukan folder (artinya ini file biasa), hapus seperti biasa
    console.log(`🗑️ Menghapus file: ${path} dengan SHA ${data.sha}`);
    const deleteResponse = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Delete ${path}`,
        sha: data.sha,
        branch: "main",
      }),
    });

    if (!deleteResponse.ok) {
      throw new Error("Gagal menghapus file");
    }

    console.log(`✅ File ${path} berhasil dihapus`);
    return res.status(200).json({ message: `Berhasil menghapus ${path}` });
  } catch (error) {
    console.error("❌ Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}

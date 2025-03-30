import { apiDomain } from "../config";
const BASE_URL = `${apiDomain}/api/v2`;

export const fetchRepos = async () => {
  const response = await fetch(`${BASE_URL}/repos`);
  if (!response.ok) throw new Error("Gagal mengambil repository");
  return response.json();
};

export const createRepoAPI = async (repoName) => {
  const response = await fetch(`${BASE_URL}/repos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repoName }),
  });

  const data = await response.json();
  console.log("Response Create Repo:", data);

  if (!response.ok) throw new Error(`Gagal membuat repository: ${data.message || "Unknown error"}`);
  return data;
};

export const deleteRepoAPI = async (repoName) => {
  console.log(`Menghapus repo: ${repoName}`);

  try {
    // const response = await fetch(`http://192.168.1.7:3000/api/repos/${repoName}`, {
    const response = await fetch(`${BASE_URL}/repos/${repoName}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gagal menghapus repo:", data);
      throw new Error(data.error || "Gagal menghapus repository");
    }

    console.log("✅ Repo berhasil dihapus:", data.message);
    return data;
  } catch (error) {
    console.error("Error saat delete repo:", error);
    throw error;
  }
};

export const fetchRepoContents = async (repoName, path = "") => {
  const url = path ? `${BASE_URL}/contents/${repoName}?path=${encodeURIComponent(path)}` : `${BASE_URL}/contents/${repoName}`;

  console.log(`📤 Mengirim request GET: ${url}`);

  const response = await fetch(url);
  if (!response.ok) throw new Error("Gagal mengambil konten repository");
  return response.json();
};

export const uploadFile = async (repoName, path, file) => {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = async function () {
      const fileContent = reader.result.split(",")[1]; // Convert ke Base64

      console.log("Mengirim file:", {
        repoName,
        path,
        fileName: file.name,
        fileContent: fileContent.slice(0, 50) + "...", // Hanya tampilkan sebagian untuk debugging
      });

      try {
        const response = await fetch(`${BASE_URL}/contents/upload`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            repoName,
            path,
            fileName: file.name,
            fileContent,
          }),
        });

        console.log("Response upload:", response);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Gagal mengupload file");
        }

        resolve(await response.json());
      } catch (error) {
        console.error("Upload error:", error);
        reject(error);
      }
    };
    reader.readAsDataURL(file);
  });
};

export const deleteFileOrFolder = async (repoName, path) => {
  console.log("📤 Mengirim DELETE request:", repoName, path);

  try {
    const response = await fetch(`${BASE_URL}/contents/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoName, path }),
    });

    const responseData = await response.json();
    console.log("📥 Response dari server:", responseData);

    if (!response.ok) {
      throw new Error(responseData.error || "Gagal menghapus file");
    }

    return responseData;
  } catch (error) {
    console.error("❌ Delete error:", error);
    throw error;
  }
};

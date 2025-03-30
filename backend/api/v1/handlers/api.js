// api/handlers/api.js
const username = "arialinux";
const token = process.env.VITE_TOKEN;

export const fetchRepos = async () => {
  const response = await fetch("https://api.github.com/user/repos", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Gagal mengambil repository");
  return response.json();
};

export const createRepoAPI = async (repoName) => {
  const response = await fetch("https://api.github.com/user/repos", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: repoName,
      private: false,
      description: `Repository ${repoName} created via Vue app`,
    }),
  });

  if (!response.ok) throw new Error("Gagal membuat repository");
  return response.json();
};

export const deleteRepoAPI = async (repoName) => {
  const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Gagal menghapus repository");
  return;
};

// Repo

// export async function fetchRepoContents(repoName, path = "") {
//   const cleanedPath = String(path || "")
//     .split(",")
//     .join("/");
//   const url = `https://api.github.com/repos/${username}/${repoName}/contents/${cleanedPath ? `${cleanedPath}` : ""}`;

//   try {
//     const response = await fetch(url, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     const data = await response.json();

//     if (!Array.isArray(data)) {
//       console.error(`Failed to fetch repo contents: ${data.message || "Unknown error"}`);
//       return [];
//     }

//     return data;
//   } catch (error) {
//     console.error("Error fetching repo contents:", error);
//     return [];
//   }
// }

export async function fetchRepoContents(repoName, path = "") {
  const cleanedPath = String(path || "")
    .split(",")
    .join("/");

  const url = `https://api.github.com/repos/${username}/${repoName}/contents/${cleanedPath ? `${cleanedPath}` : ""}`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Check if the response is valid
    if (!response.ok) {
      console.error(`Failed to fetch repo contents: ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error(`Failed to fetch repo contents: ${data.message || "Unknown error"}`);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching repo contents:", error);
    return null;
  }
}

export async function uploadFile(repoName, path, file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = async function () {
      const fileContent = reader.result.split(",")[1]; // Ambil isi file dalam Base64
      const cleanedPath = path.replace(/\/+$/, "");
      const filePath = cleanedPath ? `${cleanedPath}/${file.name}` : file.name;

      const url = `https://api.github.com/repos/${username}/${repoName}/contents/${filePath}`;

      let sha = null; // Variabel untuk menyimpan SHA file lama

      // 🔥 **Cek apakah file sudah ada** 🔥
      try {
        const existingFile = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        });

        if (existingFile.ok) {
          const fileData = await existingFile.json();
          sha = fileData.sha; // Simpan SHA file lama untuk overwrite
        }
      } catch (error) {
        console.warn(`File ${filePath} tidak ditemukan, akan dibuat baru.`);
      }

      // **Buat body request dengan SHA (jika ada)**
      const body = {
        message: `Upload ${file.name}`,
        content: fileContent,
        branch: "main",
        ...(sha && { sha }), // Tambahkan SHA jika file sudah ada
      };

      try {
        const response = await fetch(url, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          console.log(`Uploaded: ${filePath}`);
          resolve();
        } else {
          console.error(`Failed to upload ${filePath}`);
          reject();
        }
      } catch (error) {
        console.error(`Error uploading ${filePath}:`, error);
        reject();
      }
    };
    reader.readAsDataURL(file);
  });
}

export async function deleteFileOrFolder(repoName, path) {
  const url = `https://api.github.com/repos/${username}/${repoName}/contents/${path}`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();

    if (!Array.isArray(data)) {
      if (!data.sha) {
        console.error("Cannot find SHA for:", path);
        return;
      }

      await fetch(url, {
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

      console.log(`Deleted: ${path}`);
    } else {
      for (const item of data) {
        await deleteFileOrFolder(repoName, item.path);
      }
    }
  } catch (error) {
    console.error(`Failed to delete ${path}:`, error);
  }
}

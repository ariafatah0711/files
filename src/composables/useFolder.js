import { ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
// import { fetchRepoContents, uploadFile, deleteFileOrFolder } from "./api";
// import { fetchRepoContents, uploadFile, deleteFileOrFolder } from "./api_v1";
import { fetchRepoContents, uploadFile, deleteFileOrFolder } from "./api.js";
import GlobalSwal from "../utils/GlobalSwal";
import { isLoggedIn } from "../utils/auth";

const Swal = GlobalSwal;

export function useFolder() {
  const route = useRoute();
  const router = useRouter();

  const repoName = ref(route.params.repo);
  const currentPath = ref(route.params.path || "");
  const repoContents = ref([]);
  const fileQueue = ref([]);
  const selectedItems = ref(new Set());

  async function loadRepoContents() {
    selectedItems.value.clear(); // Reset selection setiap load folder
    repoContents.value = await fetchRepoContents(repoName.value, currentPath.value);
    // console.log(repoContents);
  }

  function goBack() {
    if (!currentPath.value) {
      router.push(`/`);
      return;
    }

    // Pastikan path benar
    let path = String(currentPath.value).trim();
    console.log("Current Path (Before Fix):", path);

    // FIX: Ganti koma (,) menjadi slash (/) jika ada
    path = path.replace(/,/g, "/");
    console.log("Current Path (After Fix):", path);

    if (!path || path === "" || path === "/") {
      router.push(`/${repoName.value}`);
      return;
    }

    const pathParts = path.split("/").filter(Boolean);
    console.log("Path Parts (Before Pop):", pathParts);

    pathParts.pop(); // Hapus folder terakhir

    console.log("Path Parts (After Pop):", pathParts);

    const newPath = pathParts.length > 0 ? `/${repoName.value}/${pathParts.join("/")}` : `/${repoName.value}`;

    console.log("New Path:", newPath);
    router.push(newPath);
  }

  function addFile() {
    if (!isLoggedIn()) return Swal.fire("Error", "Harus login dulu!", "error");

    const input = document.createElement("input");
    input.type = "file";
    input.style.display = "none";
    document.body.appendChild(input);

    input.addEventListener("change", (event) => {
      if (event.target.files.length === 0) return;

      for (const file of event.target.files) {
        // const existingFile = fileQueue.value.find((item) => item.file.name === file.name && item.path === "");
        const filePath = currentPath.value ? `${currentPath.value}/` : ""; // Tambahkan currentPath
        const existingFile = fileQueue.value.find((item) => item.file.name === file.name && item.path === filePath);

        if (!existingFile) {
          // fileQueue.value.push({ file, path: "" });
          fileQueue.value.push({ file, path: filePath });
        } else {
          Swal.fire("Warning", `File "${filePath}${file.name}" already exists!`, "warning");
        }
      }
      document.body.removeChild(input);
      // Swal.fire("Berhasil!", "File berhasil ditambahkan ke antrian.", "success");
    });

    input.click();
  }

  async function addFilePath() {
    if (!isLoggedIn()) return Swal.fire("Error", "Harus login dulu!", "error");

    const { value: customPath } = await Swal.fire({
      title: "Masukkan Path Tujuan",
      input: "text",
      inputLabel: "Contoh: folder/subfolder",
      inputPlaceholder: currentPath.value,
      showCancelButton: true,
      confirmButtonText: "Tambahkan",
      cancelButtonText: "Batal",
      inputValidator: (value) => {
        if (!value.trim()) return "Path tidak boleh kosong!";
        if (/^\/|\/$/.test(value)) return "Format path salah! Pastikan tidak ada '/' di awal atau akhir.";
      },
    });

    if (!customPath) return;

    const fullPath = currentPath.value ? `${currentPath.value}/${customPath.trim()}` : customPath.trim(); // Pastikan path benar

    const input = document.createElement("input");
    input.type = "file";
    input.style.display = "none";
    document.body.appendChild(input);

    input.addEventListener("change", (event) => {
      if (event.target.files.length === 0) return;

      for (const file of event.target.files) {
        console.log(fullPath);
        // const existingFile = fileQueue.value.find((item) => item.file.name === file.name && item.path === customPath.trim());
        const existingFile = fileQueue.value.find((item) => item.file.name === file.name && item.path === fullPath);

        if (!existingFile) {
          // fileQueue.value.push({ file, path: customPath.trim() });
          fileQueue.value.push({ file, path: fullPath });
        } else {
          // Swal.fire("Warning", `File "${file.name}" at "${customPath.trim()}" already exists!`, "warning");
          Swal.fire("Warning", `File "${file.name}" at "${fullPath}" already exists!`, "warning");
        }
      }
      document.body.removeChild(input);
    });

    input.click();
  }

  function addFolder() {
    if (!isLoggedIn()) return Swal.fire("Error", "Harus login dulu!", "error");

    const input = document.createElement("input");
    input.type = "file";
    input.webkitdirectory = true; // Memungkinkan memilih folder
    input.style.display = "none";
    document.body.appendChild(input);

    input.addEventListener("change", (event) => {
      if (event.target.files.length === 0) return;

      let addedFiles = 0;
      let duplicateFiles = [];

      for (const file of event.target.files) {
        const relativePath = file.webkitRelativePath;
        // const filePath = relativePath.replace(file.name, "").replace(/\/$/, ""); // Hilangkan trailing slash
        let filePath = relativePath.replace(file.name, "").replace(/\/$/, ""); // Hilangkan trailing slash

        if (currentPath.value) {
          filePath = `${currentPath.value}/${filePath}`;
        }

        console.log(filePath);

        const existingFile = fileQueue.value.find((item) => item.file.name === file.name && item.path === filePath);

        if (!existingFile) {
          fileQueue.value.push({ file, path: filePath });
          addedFiles++;
        } else {
          duplicateFiles.push(`${filePath}/${file.name}`);
        }
      }

      document.body.removeChild(input);

      if (duplicateFiles.length > 0) {
        Swal.fire({
          title: "Warning!",
          icon: "warning",
          html: `Some files were not added because they already exist:<br><b>${duplicateFiles.join("<br>")}</b>`,
        });
      }

      if (addedFiles > 0) {
        Swal.fire("Success!", `Added ${addedFiles} new files to the queue.`, "success");
      }
    });

    input.click();
  }

  async function uploadAllFiles() {
    if (!isLoggedIn()) return Swal.fire("Error", "Harus login dulu!", "error");

    if (fileQueue.value.length === 0) {
      return Swal.fire("Error", "No files to upload.", "error");
    }

    const { isConfirmed } = await Swal.fire({
      title: "Upload Files",
      text: `Are you sure you want to upload ${fileQueue.value.length} files?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, upload",
      cancelButtonText: "Cancel",
    });

    if (!isConfirmed) return;

    Swal.fire({
      title: "Uploading...",
      html: `Uploading <b>0</b> of ${fileQueue.value.length} files...<br>`,
      // showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    let uploadedCount = 0;
    let failedFiles = [];

    for (const { file, path } of fileQueue.value) {
      try {
        console.log(`updloadfile(${repoName.value}, ${path}, ${file})`);
        await uploadFile(repoName.value, path, file);
        uploadedCount++;

        // Update progress
        Swal.update({
          html: `Uploading <b>${uploadedCount}</b> of ${fileQueue.value.length} files...`,
        });
      } catch (error) {
        failedFiles.push(file.name); // Simpan nama file yang gagal
        break;
      }
    }

    // Jika semua berhasil
    if (failedFiles.length === 0) {
      Swal.fire("Success", "All files uploaded successfully!", "success");
      fileQueue.value = [];
      loadRepoContents();
    } else {
      // Menampilkan error dan daftar file yang gagal
      Swal.fire({
        title: "Upload Failed",
        icon: "error",
        html: `Some files failed to upload:<br><b>${failedFiles.join("<br>")}</b>`,
      });
    }
  }

  async function deleteSelected() {
    if (!isLoggedIn()) return Swal.fire("Error", "Harus login dulu!", "error");

    if (selectedItems.value.size === 0) {
      return Swal.fire("Error", "No files or folders selected.", "error");
    }

    const { isConfirmed } = await Swal.fire({
      title: "Delete Selected",
      text: "Are you sure you want to delete the selected files/folders?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!isConfirmed) return;

    for (const path of selectedItems.value) {
      await deleteFileOrFolder(repoName.value, path);
    }

    Swal.fire("Success", "Files/folders deleted!", "success");
    selectedItems.value.clear();
    loadRepoContents();
  }

  function toggleSelection(path) {
    if (selectedItems.value.has(path)) {
      selectedItems.value.delete(path);
    } else {
      selectedItems.value.add(path);
    }
  }

  async function handleDrop(event) {
    event.preventDefault();

    const items = event.dataTransfer.items;
    const files = event.dataTransfer.files;

    if (items) {
      const entries = [...items].map((item) => item.webkitGetAsEntry()).filter((entry) => entry);
      await Promise.all(entries.map((entry) => processEntry(entry, "")));
    } else if (files) {
      for (const file of files) {
        // const filePath = currentPath.value ? `${currentPath.value}/` : ""; // 🔥 Pastikan path sama
        const filePath = currentPath.value ? currentPath.value : "";
        // const filePath = currentPath.value ? `${currentPath.value}/` : "";
        console.log(filePath);

        // 🛠 Cek file berdasarkan nama dan path yang seragam
        const existingFile = fileQueue.value.find((item) => item.file.name === file.name && (item.path || "") === filePath);

        if (!existingFile) {
          fileQueue.value.push({ file, path: filePath });
        } else {
          Swal.fire("Warning", `File "${filePath}${file.name}" already exists!`, "warning");
        }
      }
    }
  }

  // async function processEntry(entry, parentPath) {
  //   if (entry.isFile) {
  //     return new Promise((resolve) => {
  //       entry.file((file) => {
  //         // let filePath = `${parentPath}/${file.name}`.replace(/\/+/g, "/").replace(/\/$/, "");
  //         // let filePath = parentPath ? `${parentPath}/${file.name}`.replace(/\/+/g, "/") : file.name;
  //         let filePath = parentPath ? `${parentPath}/${file.name}`.replace(/^\/+/, "").replace(/\/+/g, "/") : file.name;
  //         console.log("📂 Processed File Path:", filePath);

  //         const existingFile = fileQueue.value.find((item) => item.file.name === file.name && item.path === parentPath);
  //         if (!existingFile) {
  //           fileQueue.value.push({ file, path: filePath });
  //         } else {
  //           Swal.fire("Warning", `File "${filePath}" already exists!`, "warning");
  //         }
  //         resolve();
  //       });
  //     });
  //   } else if (entry.isDirectory) {
  //     const reader = entry.createReader();
  //     return new Promise((resolve) => {
  //       reader.readEntries(async (entries) => {
  //         await Promise.all(
  //           entries.map((subEntry) => processEntry(subEntry, `${parentPath}/${entry.name}`.replace(/\/+/g, "/")))
  //         );
  //         resolve();
  //       });
  //     });
  //   }
  // }

  async function processEntry(entry, parentPath) {
    if (entry.isFile) {
      return new Promise((resolve) => {
        entry.file((file) => {
          let basePath = currentPath.value ? `${currentPath.value}/` : "";
          let filePath = parentPath
            ? `${basePath}${parentPath}/${file.name}`.replace(/^\/+/, "").replace(/\/+/g, "/")
            : `${basePath}${file.name}`;
          // let filePath = parentPath ? `${parentPath}/${file.name}`.replace(/^\/+/, "").replace(/\/+/g, "/") : file.name;

          console.log("📂 Processed File Path:", filePath);

          if (filePath.endsWith(file.name)) {
            filePath = filePath.slice(0, -file.name.length).replace(/\/$/, "");
          }

          console.log("📂 Normalized File Path:", filePath);

          const existingFile = fileQueue.value.find((item) => item.file.name === file.name && item.path === filePath);

          console.log("🛠 existingFile:", existingFile);

          if (!existingFile) {
            fileQueue.value.push({ file, path: filePath });
          } else {
            Swal.fire("Warning", `File "${filePath}/${file.name}" already exists!`, "warning");
          }
          resolve();
        });
      });
    } else if (entry.isDirectory) {
      const reader = entry.createReader();
      return new Promise((resolve) => {
        reader.readEntries(async (entries) => {
          await Promise.all(
            entries.map((subEntry) =>
              processEntry(subEntry, `${parentPath}/${entry.name}`.replace(/^\/+/, "").replace(/\/+/g, "/"))
            )
          );
          resolve();
        });
      });
    }
  }

  watch(
    () => route.params,
    (newParams) => {
      repoName.value = newParams.repo;
      currentPath.value = newParams.path || "";
      selectedItems.value.clear(); // Reset selection setiap navigasi
      loadRepoContents();
    }
  );

  onMounted(loadRepoContents);

  return {
    repoName,
    currentPath,
    repoContents,
    fileQueue,
    selectedItems,
    loadRepoContents,
    goBack,
    addFile,
    addFilePath,
    addFolder,
    uploadAllFiles,
    deleteSelected,
    toggleSelection,
    handleDrop,
  };
}

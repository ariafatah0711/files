import { ref, onMounted } from "vue";
// import { fetchRepos, createRepoAPI, deleteRepoAPI } from "./api";
// import { fetchRepos, createRepoAPI, deleteRepoAPI } from "./api_v1";
import { fetchRepos, createRepoAPI, deleteRepoAPI } from "./api.js";
import GlobalSwal from "../utils/GlobalSwal";
import { isLoggedIn } from "../utils/auth";

const Swal = GlobalSwal;
const loggedIn = ref(false);

export function useRepo() {
  const repos = ref([]);

  onMounted(() => {
    loggedIn.value = isLoggedIn();
  });

  const listRepos = async () => {
    try {
      repos.value = await fetchRepos();
      // const reposData = await fetchRepos();
      // console.log(reposData);
      // repos.value = reposData;
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const createRepo = async () => {
    if (!isLoggedIn()) return Swal.fire("Error", "Harus login dulu!", "error");

    const { value: repoName } = await Swal.fire({
      title: "Buat Repository",
      input: "text",
      inputLabel: "Masukkan nama repository",
      inputPlaceholder: "Nama repository...",
      showCancelButton: true,
      confirmButtonText: "Buat",
      cancelButtonText: "Batal",
    });

    if (!repoName) return;

    try {
      await createRepoAPI(repoName);
      Swal.fire("Berhasil!", `Repository "${repoName}" berhasil dibuat!`, "success");
      listRepos();
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const deleteRepo = async (repoName) => {
    if (!isLoggedIn()) return Swal.fire("Error", "Harus login dulu!", "error");

    const { value: confirmName } = await Swal.fire({
      title: "Konfirmasi Hapus",
      input: "text",
      inputLabel: `Ketik "${repoName}" untuk menghapus repository ini`,
      inputPlaceholder: repoName,
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      icon: "warning",
      inputValidator: (value) => {
        if (value !== repoName) return "Nama repository tidak cocok.";
      },
    });

    if (!confirmName) return;

    try {
      await deleteRepoAPI(repoName);
      Swal.fire("Berhasil!", `Repository "${repoName}" berhasil dihapus!`, "success");
      listRepos();
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  return {
    repos,
    listRepos,
    createRepo,
    deleteRepo,
  };
}

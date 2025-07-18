<script setup>
import IconButton from "../components/IconButton.vue";
import { onMounted } from "vue";
import { useRepo } from "../composables/useRepo";
import { FolderAddOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import { useRouter, useRoute } from "vue-router";
import { handleDownloadByQuery } from "../utils/Download"
import { getActiveAccount, getActiveAccountIndex, isWriteModeForUser } from "../utils/auth";
import GlobalSwal from "../utils/GlobalSwal";

const { repos, listRepos, createRepo, deleteRepo, loading, error } = useRepo();
const router = useRouter();
const route = useRoute();
const Swal = GlobalSwal;

function checkWriteMode() {
  const idx = getActiveAccountIndex();
  const acc = getActiveAccount();
  if (!isWriteModeForUser(idx, acc?.password)) {
    Swal.fire("Read Only", "Aktifkan Write Mode untuk melakukan perubahan!", "warning");
    return false;
  }
  return true;
}

function handleCreateRepo() { if (!checkWriteMode()) return; createRepo(); }
function handleDeleteRepo(name) { if (!checkWriteMode()) return; deleteRepo(name); }

onMounted(() => {
  listRepos()
  console.log(repos)
  const downloadPath = route.query.download;
  if (downloadPath) {
    handleDownloadByQuery(downloadPath);
  }
});
</script>

<template>
  <div class="p-4 min-h-screen">
    <h2 class="text-xl font-semibold mb-4">
      <router-link to="/" class="text-blue-500 hover:underline">Repository List</router-link>
    </h2>
    
    <div class="flex flex-wrap gap-4 justify-left pb-4">
      <IconButton @click="handleCreateRepo" :icon="FolderAddOutlined" label="Tambah Repository" color="blue" />
    </div>

    <div v-if="error" class="text-red-500 font-semibold">
      ❌ Terjadi Kesalahan: {{ error.message || "Gagal memuat repository." }}
    </div>

    <div v-else-if="loading" class="text-gray-500">Loading...</div>

    <div v-else-if="repos.length === 0" class="text-gray-500">
      📂 Belum ada repository. Tambahkan repository baru untuk memulai.
    </div>
    
    <ul v-else>
      <li v-for="repo in repos" :key="repo.id" class="flex justify-between items-center my-2 p-3 bg-gray-100 rounded shadow-md hover:bg-blue-100 cursor-pointer" @click="router.push(`/${repo.name}`)">
        
        <button class="bg-blue-500 text-white p-2 m-2 rounded hover:bg-blue-600 cursor-pointer w-12 text-center">
          📁
        </button>
        
        <span class="w-full text-blue-600 text-lg font-medium hover:text-blue-800 truncate">
          {{ repo.name }}
        </span>

        <div class="flex items-center ml-auto">
          <button class="flex bg-red-500 text-white p-3 rounded-full hover:bg-red-600 cursor-pointer" @click.stop="handleDeleteRepo(repo.name)">
            <DeleteOutlined />
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>
<script setup>
import IconButton from "../components/IconButton.vue";
import { onMounted } from "vue";
import { useRepo } from "../composables/useRepo";
import { FolderAddOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import { useRouter, useRoute } from "vue-router";
import { handleDownloadByQuery } from "../utils/Download"
import { getActiveAccount, getActiveAccountIndex, isWriteModeForUser } from "../utils/auth";
import GlobalSwal from "../utils/GlobalSwal";
import Breadcrumb from "../components/Breadcrumb.vue";

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
  <div class="">
    <Breadcrumb />
    <div class="flex flex-wrap gap-4 pb-6">
      <IconButton @click="handleCreateRepo" :icon="FolderAddOutlined" label="Tambah Repository" color="blue" />
    </div>
    <div v-if="error" class="text-red-500 font-semibold">
      ❌ Terjadi Kesalahan: {{ error.message || "Gagal memuat repository." }}
    </div>
    <div v-else-if="loading" class="text-gray-500">Loading...</div>
    <div v-else-if="repos.length === 0" class="text-gray-500">
      📂 Belum ada repository. Tambahkan repository baru untuk memulai.
    </div>
    <ul v-else class="flex flex-col gap-4">
      <li v-for="repo in repos" :key="repo.id" class="group flex items-center gap-4 bg-white rounded-xl shadow p-4 border border-gray-100 hover:bg-blue-50 transition cursor-pointer" @click="router.push(`/${repo.name}`)">
        <div class="flex items-center justify-center bg-yellow-100 text-yellow-500 rounded-lg w-12 h-12 font-bold text-xl shadow-sm">
          <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg>
        </div>
        <span class="flex-1 text-blue-700 text-lg font-semibold truncate">
          {{ repo.name }}
        </span>
        <button class="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors cursor-pointer opacity-0 group-hover:opacity-100" @click.stop="handleDeleteRepo(repo.name)">
          <DeleteOutlined />
        </button>
      </li>
    </ul>
  </div>
</template>
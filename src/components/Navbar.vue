<template>
  <nav class="fixed top-0 left-0 w-full bg-white/80 backdrop-blur shadow z-50 border-b border-gray-200">
    <div class="max-w-5xl mx-auto flex items-center justify-between px-4 py-2">
      <!-- Judul -->
      <div class="flex items-center gap-2">
        <a href="/" class="font-bold text-blue-700 text-lg hover:underline hover:text-blue-900 transition">
          {{ appName }}
        </a>
        <span class="ml-2 text-xs text-gray-400">v{{ appVersion }}</span>
      </div>
      <!-- Status & Tombol -->
      <div class="flex items-center gap-3">
        <!-- Tombol Write Mode/Lock di kiri (desktop) -->
        <template v-if="activeAccount && activeAccount.type === 'api'">
          <button
            v-if="writeMode"
            @click="handleLockWrite"
            class="w-28 flex items-center gap-2 px-3 py-1 rounded bg-green-100 hover:bg-green-200 text-green-700 font-semibold text-xs border border-green-300"
            title="Kunci kembali ke read-only"
          >
            <span class="icon-unlock"></span> Write Mode
          </button>
          <button
            v-else
            @click="showWriteModal = true"
            class="w-28 flex items-center gap-2 px-3 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700 font-semibold text-xs border border-red-300"
            title="Aktifkan Write Mode"
          >
            <span class="icon-lock"></span> Read Only
          </button>
        </template>
        <!-- Dropdown akun -->
        <div class="hidden md:flex items-center gap-3 relative">
          <button
            v-if="activeAccount"
            class="flex items-center gap-2 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs border border-gray-300"
            @click="showAccountDropdown = !showAccountDropdown"
          >
            <span class="icon-user"></span>
            {{ activeAccount.name || 'Akun' }}
            <span class="icon-chevron-down"></span>
          </button>
          <div v-if="showAccountDropdown" class="absolute right-0 top-10 bg-white border border-gray-200 shadow-lg rounded w-56 z-50">
            <div class="max-h-60 overflow-y-auto divide-y divide-gray-100">
              <div v-for="(acc, idx) in accounts" :key="idx" class="flex items-center justify-between px-4 py-2 hover:bg-blue-50 cursor-pointer"
                @click="handleSwitchAccount(idx)">
                <div class="flex items-center gap-2">
                  <span v-if="activeAccount.name === acc.name && activeAccount.type === acc.type" class="text-green-500">●</span>
                  <span v-else class="text-gray-300">○</span>
                  <span class="font-medium text-sm">{{ acc.name }}</span>
                  <span class="text-xs text-gray-400">{{ acc.type === 'api' ? 'Default' : acc.type === 'local' ? 'Lokal' : 'Custom' }}</span>
                </div>
              </div>
              <!-- Tombol tambah user lokal di bawah list akun (dropdown) -->
              <div class="px-4 py-2 flex flex-col gap-2">
                <button
                  class="w-full px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs border border-blue-300"
                  @click.stop="showAddUserModal = true; showWriteModal = false"
                  title="Tambah User Lokal"
                >
                  + User Lokal
                </button>
                <button
                  v-if="localUsers.length > 0"
                  class="w-full px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700 text-xs border border-red-300"
                  @click.stop="showDeleteUserModal = true; showAddUserModal = false; showWriteModal = false"
                  title="Hapus User Lokal"
                >
                  Hapus User Lokal
                </button>
              </div>
            </div>
          </div>
        </div>
        <!-- Hamburger menu for mobile -->
        <button @click="menuOpen = !menuOpen" class="md:hidden text-gray-700 ml-2">
          <span class="icon-menu"></span>
        </button>
      </div>
    </div>
    <!-- Mobile menu -->
    <div v-if="menuOpen" class="md:hidden bg-white shadow border-t border-gray-200 px-4 py-8 flex flex-col gap-6">
      <div class="flex flex-col gap-1 mb-2">
        <button
          v-for="(acc, idx) in accounts"
          :key="idx"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition font-medium shadow-sm"
          :class="activeAccount.name === acc.name && activeAccount.type === acc.type ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-50'"
          @click="handleSwitchAccount(idx)"
        >
          <span v-if="activeAccount.name === acc.name && activeAccount.type === acc.type" class="text-green-500">●</span>
          <span v-else class="text-gray-300">○</span>
          <span class="font-medium">{{ acc.name }}</span>
          <span class="text-xs text-gray-400">{{ acc.type === 'api' ? 'Default' : acc.type === 'local' ? 'Lokal' : 'Custom' }}</span>
        </button>
        <button
          class="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold border border-blue-600 shadow transition"
          @click="showAddUserModal = true; showWriteModal = false"
          title="Tambah User Lokal"
        >
          <span class="icon-user"></span> + User Lokal
        </button>
        <button
          v-if="localUsers.length > 0"
          class="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-sm font-semibold border border-red-300 shadow transition"
          @click="showDeleteUserModal = true; showAddUserModal = false; showWriteModal = false"
          title="Hapus User Lokal"
        >
          <span class="icon-user"></span> Hapus User Lokal
        </button>
      </div>
    </div>
    <!-- Modal Write Mode -->
    <div v-if="showWriteModal" class="fixed top-20 right-6 z-50 bg-white rounded-lg shadow-lg p-6 max-w-xs w-full border border-gray-200 animate-slide-in">
      <button @click="showWriteModal = false" type="button" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl" title="Tutup">&times;</button>
      <h3 class="text-lg font-bold mb-4 text-blue-700 flex items-center gap-2">
        <span class="icon-unlock"></span> Masukkan Password
      </h3>
      <label class="block mb-2 text-sm font-medium text-gray-700">Password akun <b>{{ activeAccount?.name }}</b></label>
      <input
        type="password"
        class="w-full border border-gray-300 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Password akun..."
        v-model="writePassword"
        autofocus
      />
      <div v-if="writeError" class="text-red-500 text-xs mb-2">{{ writeError }}</div>
      <div class="flex gap-2 mb-2">
        <button
          @click="handleUnlockWrite"
          class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
        >
          Unlock Write
        </button>
      </div>
      <p class="text-xs text-gray-500 mt-2">
        Masukkan password akun untuk mengaktifkan mode tulis (write mode).<br />
        Setelah aktif, kamu bisa menambah/mengedit file.<br />
        Jangan lupa lock kembali jika sudah selesai.
      </p>
    </div>
    <!-- Modal tambah user lokal: Username & API -->
    <div v-if="showAddUserModal" class="fixed top-20 right-6 z-50 bg-white rounded-lg shadow-lg p-6 max-w-xs w-full border border-gray-200 animate-slide-in">
      <button @click="showAddUserModal = false" type="button" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl" title="Tutup">&times;</button>
      <h3 class="text-lg font-bold mb-4 text-blue-700 flex items-center gap-2">Tambah User Lokal</h3>
      <label class="block mb-2 text-sm font-medium text-gray-700">Username</label>
      <input
        type="text"
        class="w-full border border-gray-300 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Username..."
        v-model="newUserName"
        autofocus
      />
      <label class="block mb-2 text-sm font-medium text-gray-700">API</label>
      <input
        type="text"
        class="w-full border border-gray-300 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Personal Access Token..."
        v-model="newUserPassword"
      />
      <div v-if="addUserError" class="text-red-500 text-xs mb-2">{{ addUserError }}</div>
      <div class="flex gap-2 mb-2">
        <button
          @click="handleAddCustomUser"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Tambah
        </button>
      </div>
      <p class="text-xs text-gray-700 mt-2 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
        <b class="text-yellow-700">Penting!</b><br />
        <b>Gunakan token dari akun GitHub khusus testing.</b><br />
        <span class="text-yellow-700">Jangan gunakan token dari akun utama yang punya banyak repo penting.</span><br />
        Token harus punya scope <b>repo</b> (read & write).<br />
        <a href='https://github.com/settings/tokens/new?scopes=repo,write:packages&description=files_repo' target='_blank' rel='noopener noreferrer' class='text-blue-600 underline'>Buat token di sini</a>.<br />
        Token ini hanya untuk akses repo di akun tersebut, tidak bisa edit repo utama kamu.<br />
        <b class="text-yellow-700">Simpan token ini dengan aman, dan hapus jika sudah tidak digunakan.</b><br />
        <span class="text-red-600 font-bold">Username yang diinput harus persis sama dengan username GitHub!</span>
      </p>
    </div>
    <!-- Modal hapus user lokal -->
    <div v-if="showDeleteUserModal" class="fixed top-20 right-6 z-50 bg-white rounded-lg shadow-lg p-6 max-w-xs w-full border border-gray-200 animate-slide-in">
      <button @click="showDeleteUserModal = false" type="button" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl" title="Tutup">&times;</button>
      <h3 class="text-lg font-bold mb-4 text-red-700 flex items-center gap-2">
        <span class="icon-user"></span> Hapus User Lokal
      </h3>
      <div v-if="localUsers.length === 0" class="text-gray-500 text-sm mb-2">Tidak ada user lokal.</div>
      <div v-else class="flex flex-col gap-2 mb-4 max-h-40 overflow-y-auto">
        <label v-for="acc in localUsers" :key="acc.name" class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            :checked="selectedDeleteUsers.includes(acc.name)"
            @change="toggleDeleteUser(acc.name)"
          />
          <span class="font-medium text-blue-700">{{ acc.name }}</span>
        </label>
      </div>
      <button
        @click="handleDeleteSelectedUsers"
        class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors disabled:opacity-50"
        :disabled="selectedDeleteUsers.length === 0"
      >
        Hapus
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import packageJson from '../../package.json';
import GlobalSwal from '../utils/GlobalSwal';
import {
  getAllAccounts,
  getActiveAccount,
  setActiveAccount,
  setWriteModeForUser,
  clearWriteModeForUser,
  isWriteModeForUser,
  getActiveAccountIndex,
  addCustomUser,
  removeCustomAccount
} from '../utils/auth';

const Swal = GlobalSwal;
const appName = packageJson.name;
const appVersion = packageJson.version;
const menuOpen = ref(false);
const showAccountDropdown = ref(false);
const showWriteModal = ref(false);
const showAddUserModal = ref(false);
const showDeleteUserModal = ref(false);
const writePassword = ref('');
const writeError = ref('');
const writeMode = ref(false);
const newUserName = ref('');
const newUserPassword = ref('');
const addUserError = ref('');
const selectedDeleteUsers = ref([]);

const accounts = ref([]);
const activeAccount = ref(null);

const refreshAccounts = () => {
  accounts.value = getAllAccounts();
  activeAccount.value = getActiveAccount();
};

const localUsers = computed(() => accounts.value.filter(acc => acc.type === 'local'));

onMounted(() => {
  refreshAccounts();
  const acc = getActiveAccount();
  const idx = getActiveAccountIndex();
  writeMode.value = acc && isWriteModeForUser(idx, acc.password);
});

function handleSwitchAccount(idx) {
  setActiveAccount(idx);
  const acc = getAllAccounts()[idx];
  writeMode.value = acc && isWriteModeForUser(idx, acc.password);
  refreshAccounts();
  window.location.reload();
}

function handleUnlockWrite() {
  if (!activeAccount.value) return;
  const idx = getActiveAccountIndex();
  if (writePassword.value === activeAccount.value.password) {
    setWriteModeForUser(idx, writePassword.value);
    writeMode.value = true;
    showWriteModal.value = false;
    writePassword.value = '';
    writeError.value = '';
    Swal.fire('Write Mode Aktif', 'Sekarang kamu bisa menulis/mengedit file.', 'success');
  } else {
    writeError.value = 'Password salah!';
  }
}

function handleLockWrite() {
  const idx = getActiveAccountIndex();
  clearWriteModeForUser(idx);
  writeMode.value = false;
  Swal.fire('Write Mode Dimatikan', 'Sekarang hanya bisa read-only.', 'info');
}

function handleAddCustomUser() {
  if (!newUserName.value || !newUserPassword.value) {
    addUserError.value = 'Username dan API wajib diisi!';
    return;
  }
  addCustomUser({ name: newUserName.value, api: newUserPassword.value, type: 'local' });
  showAddUserModal.value = false;
  newUserName.value = '';
  newUserPassword.value = '';
  addUserError.value = '';
  refreshAccounts();
  setActiveAccount(getAllAccounts().length - 1);
  window.location.reload();
}

function toggleDeleteUser(name) {
  if (selectedDeleteUsers.value.includes(name)) {
    selectedDeleteUsers.value = selectedDeleteUsers.value.filter(n => n !== name);
  } else {
    selectedDeleteUsers.value.push(name);
  }
}

async function handleDeleteSelectedUsers() {
  if (selectedDeleteUsers.value.length === 0) return;
  const result = await Swal.fire({
    title: `Yakin ingin menghapus ${selectedDeleteUsers.value.length} user lokal?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#aaa',
  });
  if (!result.isConfirmed) return;
  const customAccounts = getAllAccounts().filter(acc => acc.type === 'local');
  selectedDeleteUsers.value.forEach(name => {
    const idx = customAccounts.findIndex(acc => acc.name === name);
    if (idx !== -1) removeCustomAccount(idx);
  });
  showDeleteUserModal.value = false;
  selectedDeleteUsers.value = [];
  refreshAccounts();
  setActiveAccount(0);
  window.location.reload();
}

// Props untuk daftar links
const props = defineProps({
  links: {
    type: Array,
    required: false,
    default: () => []
  }
});
</script>

<style scoped>
nav {
  backdrop-filter: blur(10px);
}
.icon-user { display: inline-block; width: 1em; height: 1em; background: url('data:image/svg+xml;utf8,<svg fill="none" stroke="%23000" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a7.5 7.5 0 0 1 13 0"/></svg>') center/contain no-repeat; }
.icon-lock { display: inline-block; width: 1em; height: 1em; background: url('data:image/svg+xml;utf8,<svg fill="none" stroke="%23f00" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="11" width="14" height="8" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>') center/contain no-repeat; }
.icon-unlock { display: inline-block; width: 1em; height: 1em; background: url('data:image/svg+xml;utf8,<svg fill="none" stroke="%23080" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="11" width="14" height="8" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4M12 17v-2"/></svg>') center/contain no-repeat; }
.icon-chevron-down { display: inline-block; width: 1em; height: 1em; background: url('data:image/svg+xml;utf8,<svg fill="none" stroke="%23000" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6"/></svg>') center/contain no-repeat; }
.icon-menu { display: inline-block; width: 1.5em; height: 1.5em; background: url('data:image/svg+xml;utf8,<svg fill="none" stroke="%23000" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16M4 12h16M4 18h16"/></svg>') center/contain no-repeat; }
</style>
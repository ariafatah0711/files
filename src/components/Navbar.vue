<!-- <template>
    <nav class="p-4 bg-gray-100 flex justify-between items-center shadow-md">
      <a href="/" className="text-blue-500 hover:underline">
            <h3 className="text-lg font-semibold">{{ appName }} v{{  appVersion }}</h3>
      </a>
      
      <div v-if="loggedIn" class="flex items-center gap-4">
        <span class="flex items-center text-sm text-green-500">
          <UserOutlined class="h-5 w-5 mr-2" />
          <span class="hidden sm:block">Logged In</span>
          <span class="sm:hidden">✅</span>
        </span>
        <IconButton @click="handleLogout" :icon="LogoutOutlined" label="Logout" color="red" />
      </div>
      <IconButton v-else @click="handleLogin" :icon="LoginOutlined" label="Login" color="blue" />
    </nav>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import IconButton from "../components/IconButton.vue";
    import { LoginOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons-vue";
    import GlobalSwal from '../utils/GlobalSwal';
    import packageJson from '../../package.json';
    import { login, logout, isLoggedIn } from '../utils/auth';

    const Swal = GlobalSwal;
    const loggedIn = ref(false);
    const appName = packageJson.name;
    const appVersion = packageJson.version;

    onMounted(() => {
        loggedIn.value = isLoggedIn();
    });

    const handleLogin = async () => {
        const { value: password } = await Swal.fire({
            title: "Login",
            input: "password",
            inputPlaceholder: "Masukkan password",
            showCancelButton: true,
            confirmButtonText: "Login",
            cancelButtonText: "Batal",
            inputAttributes: { autocapitalize: "off" },
        });

        if (password) {
            if (login(password)) {
            Swal.fire("Berhasil!", "Login sukses!", "success");
            loggedIn.value = true;
            } else {
            Swal.fire("Gagal!", "Password salah!", "error");
            }
        }
    };

    const handleLogout = () => {
        Swal.fire({
            title: "Konfirmasi",
            text: "Yakin ingin logout?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Logout",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
            logout();
            loggedIn.value = false;
            Swal.fire("Logout!", "Anda telah logout.", "success");
            }
        });
    };
</script> -->

<template>
  <nav class="fixed top-0 left-0 w-full bg-gray-100 shadow-md p-4 flex justify-between items-center z-50">
    <a href="/" class="text-blue-500 hover:underline">
      <h3 class="text-lg font-semibold">{{ appName }} v{{ appVersion }}</h3>
    </a>

    <!-- Links di desktop -->
    <div class="hidden md:flex gap-6">
      <a v-for="link in links" :key="link.path" :href="link.path" class="text-gray-700 hover:text-blue-500">
        {{ link.name }}
      </a>
    </div>

    <div class="hidden md:flex items-center gap-4">
      <span v-if="loggedIn" class="text-green-500 flex items-center">
        <UserOutlined class="h-5 w-5 mr-2" />
        <span class="hidden sm:block">Logged In</span>
      </span>
      <IconButton v-if="loggedIn" @click="handleLogout" :icon="LogoutOutlined" label="Logout" color="red" />
      <IconButton v-else @click="handleLogin" :icon="LoginOutlined" label="Login" color="blue" />
    </div>

    <button @click="menuOpen = !menuOpen" class="md:hidden text-gray-700 mr-4 cursor-pointer">
      <MenuOutlined />
    </button>

    <!-- Links di mobile -->
    <div v-if="menuOpen" class="absolute top-16 left-0 w-full bg-white shadow-md p-4 flex flex-col gap-4 md:hidden">
      <a v-for="link in links" :key="link.path" :href="link.path" class="text-gray-700 hover:text-blue-500">
        {{ link.name }}
      </a>
      <hr>
      <div class="flex flex-col gap-2">
        <span v-if="loggedIn" class="text-green-500 flex items-center">
          <UserOutlined class="h-5 w-5 mr-2" />
          Logged In
        </span>
        <IconButton v-if="loggedIn" @click="handleLogout" :icon="LogoutOutlined" label="Logout" color="red" alwaysShowLabel />
        <IconButton v-else @click="handleLogin" :icon="LoginOutlined" label="Login" color="blue" alwaysShowLabel />
      </div>
    </div>
  </nav>
</template>
  
<script setup>
import { ref, onMounted } from 'vue';
import IconButton from "../components/IconButton.vue";
import { LoginOutlined, LogoutOutlined, UserOutlined, MenuOutlined } from "@ant-design/icons-vue";
import GlobalSwal from '../utils/GlobalSwal';
import packageJson from '../../package.json';
import { login, logout, isLoggedIn } from '../utils/auth';

// Props untuk daftar links
defineProps({
  links: {
    type: Array,
    required: true
  }
});

const Swal = GlobalSwal;
const loggedIn = ref(false);
const appName = packageJson.name;
const appVersion = packageJson.version;
const menuOpen = ref(false);

onMounted(() => {
  loggedIn.value = isLoggedIn();
});

const handleLogin = async () => {
  const { value: password } = await Swal.fire({
    title: "Login",
    input: "password",
    inputPlaceholder: "Masukkan password",
    showCancelButton: true,
    confirmButtonText: "Login",
    cancelButtonText: "Batal",
  });

  if (password) {
    if (login(password)) {
      Swal.fire("Berhasil!", "Login sukses!", "success");
      loggedIn.value = true;
    } else {
      Swal.fire("Gagal!", "Password salah!", "error");
    }
  }
};

const handleLogout = () => {
  Swal.fire({
    title: "Konfirmasi",
    text: "Yakin ingin logout?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Logout",
    cancelButtonText: "Batal",
  }).then((result) => {
    if (result.isConfirmed) {
      logout();
      loggedIn.value = false;
      Swal.fire("Logout!", "Anda telah logout.", "success");
    }
  });
};
</script>
  
<style scoped>
  nav {
    backdrop-filter: blur(10px);
  }
</style>
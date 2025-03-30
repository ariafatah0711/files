<template>
    <nav class="p-4 bg-gray-100 flex justify-between items-center shadow-md">
      <router-link to="/" class="text-blue-500 hover:underline">
        <h3 class="text-lg font-semibold">{{ appName }} v{{ appVersion }}</h3>
      </router-link>
      
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
</script>

<style scoped>
/* Additional styling if needed */
</style>
<template>
    <nav class="breadcrumb w-full truncate">
      <router-link :to="`/`" class="text-blue-500 hover:underline">
        /
      </router-link>

      <router-link :to="`/${repoName}`" class="text-blue-500 hover:underline">
        {{ repoName }}
      </router-link>
  
      <template v-if="pathParts.length">
        <span> / </span>
        <template v-for="(folder, index) in pathParts" :key="index">
          <template v-if="index !== pathParts.length - 1">
            <router-link :to="generatePath(index)" class="text-blue-500 hover:underline">
              {{ folder }}
            </router-link>
            <span> / </span>
          </template>
          <template v-else>
            <span class="text-gray-600">{{ folder }}</span>
          </template>
        </template>
      </template>
    </nav>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const repoName = computed(() => route.params.repo || "Home");

const rawPath = computed(() => {
  return Array.isArray(route.params.path)
    ? route.params.path.join('/')
    : route.params.path || '';
});

const pathParts = computed(() => {
  return rawPath.value ? rawPath.value.split('/') : [];
});

const generatePath = (index) => {
  const subPath = pathParts.value.slice(0, index + 1).join('/');
  return `/${repoName.value}/${subPath}`;
};

// console.log("repoName:", repoName.value);
// console.log("pathParts:", pathParts.value);
</script>

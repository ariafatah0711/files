<template>
  <div class="flex items-center gap-2 text-sm text-gray-500 mb-4">
    <button @click="goHome" class="hover:text-blue-600 flex items-center gap-1">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 12l9-9 9 9"/><path d="M9 21V9h6v12"/></svg>
      Home
    </button>
    <template v-for="(segment, idx) in segments" :key="idx">
      <svg class="w-4 h-4 mx-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
      <button
        v-if="idx < segments.length - 1"
        @click="goTo(idx)"
        class="hover:text-blue-600 font-semibold"
      >
        {{ segment }}
      </button>
      <span v-else class="font-bold text-blue-700">{{ segment }}</span>
    </template>
    <template v-if="currentFile">
      <svg class="w-4 h-4 mx-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
      <span class="text-gray-700">{{ currentFile }}</span>
    </template>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const repoName = computed(() => route.params.repo || "");
const rawPath = computed(() => {
  return Array.isArray(route.params.path)
    ? route.params.path.join("/")
    : route.params.path || '';
});
const segments = computed(() => {
  const arr = [];
  if (repoName.value) arr.push(repoName.value);
  if (rawPath.value) arr.push(...rawPath.value.split("/").filter(Boolean));
  return arr;
});
const currentFile = computed(() => route.query.file || "");

function goHome() {
  router.push("/");
}
function goTo(idx) {
  // Build path up to idx
  const repo = segments.value[0];
  const subPath = segments.value.slice(1, idx + 1).join("/");
  if (subPath) {
    router.push(`/${repo}/${subPath}`);
  } else {
    router.push(`/${repo}`);
  }
}
</script>

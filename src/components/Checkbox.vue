<template>
    <label @click.stop class="inline-flex items-center cursor-pointer">
      <input type="checkbox" v-model="isChecked" class="hidden" />
      <span
        class="w-6 h-6 flex items-center justify-center border-2 border-gray-300 rounded-md bg-white text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <svg
          class="w-4 h-4 transition-transform"
          :class="{ 'scale-100': isChecked, 'scale-0': !isChecked }"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    </label>
</template>

<script setup>
  import { ref, watch } from 'vue';

  const props = defineProps({
    modelValue: Boolean,
  });
  const emit = defineEmits(['update:modelValue']);
  const isChecked = ref(props.modelValue);

  watch(isChecked, (newValue) => {
    emit('update:modelValue', newValue);
  });
</script>
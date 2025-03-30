<template>
    <button 
      :class="[baseClasses, colorClasses[color]]" 
      @click="onClick"
    >
      <component :is="icon" class="text-xl" />
      <span class="hidden sm:block ml-2">{{ label }}</span>
    </button>
</template>
  
<script>
  export default {
    props: {
      onClick: Function,
      icon: [Object, Function, String],
      label: String,
      color: {
        type: String,
        default: 'blue',
        validator: (value) => ['blue', 'green', 'red'].includes(value)
      }
    },
    computed: {
      baseClasses() {
        return 'text-white px-4 py-2 rounded cursor-pointer flex items-center gap-2 w-auto min-h-[45px] min-w-[20px] max-w-[300px]';
      },
      colorClasses() {
        return {
          gray: "bg-gray-500 hover:bg-gray-600",
          blue: "bg-blue-500 hover:bg-blue-600",
          green: "bg-green-500 hover:bg-green-600",
          yellow: "bg-yellow-500 hover:bg-yellow-600",
          purple: "bg-purple-500 hover:bg-purple-600",
          red: "bg-red-500 hover:bg-red-600",
        };
      }
    }
  };
</script>
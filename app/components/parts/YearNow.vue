<script setup lang="ts">
const year = ref("");

onMounted(() => {
  year.value = String(new Date().getUTCFullYear()); // UTCでズレ回避
});
</script>

<template>
  <span>{{ year }}</span>
</template>

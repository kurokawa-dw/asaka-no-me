<script setup lang="ts">
const route = useRoute();
const isTopPage = computed(() => {
  return route.path === "/";
});
</script>

<template>
  <NuxtLayout>
    <div class="page-contents" :class="isTopPage && 'is-top-page'">
      <NuxtPage />
    </div>
  </NuxtLayout>
</template>

<style scoped lang="scss">
@use "@/assets/scss/variable" as *;
@use "@/assets/scss/mixin/" as *;
@use "@/assets/scss/component/utiltyPlaceholders";
@use "sass:math";
.page-contents {
  @include pc {
    padding-top: rem(100);
    padding-bottom: rem(100);
    min-height: calc(100vh - rem(80));
  }

  @include sp {
    padding-top: rem(100);
    padding-bottom: rem(100);
    min-height: calc(100vh - rem(50));
  }

  &.is-top-page {
    padding: 0;
  }
}
</style>

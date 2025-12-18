<script setup lang="ts">
const props = defineProps<{
  onClose: () => void;
}>();

const navData = [
  {
    label: "トップ",
    path: "/",
  },
  {
    label: "朝霞の目につてい",
    path: "/about",
  },
  {
    label: "お問い合わせ",
    path: "/contact",
  },
];
</script>

<template>
  <div class="nav">
    <ul class="nav__list">
      <li v-for="data in navData" :key="data.path">
        <NuxtLink :to="data.path" @click="onClose">{{ data.label }}</NuxtLink>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/scss/variable" as *;
@use "@/assets/scss/mixin/" as *;
@use "@/assets/scss/component/utiltyPlaceholders";
@use "sass:math";

.nav {
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  &__list {
    display: flex;
    flex-direction: column;
    gap: 1em;
    a {
      font-weight: 700;
      font-size: rem(20);
    }
  }
}
</style>

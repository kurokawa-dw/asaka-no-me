<script setup lang="ts">
// const props = defineProps<{
//   onClose: () => void;
// }>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const navData = [
  {
    label: "トップ",
    path: "/",
  },
  {
    label: "朝霞の目について",
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
        <NuxtLink :to="data.path" @click="emit('close')">{{
          data.label
        }}</NuxtLink>
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
    // gap: 1em;
    li {
      border-top: 1px solid #aaa;
      &:last-child {
        border-bottom: 1px solid #aaa;
      }
    }
    a {
      display: block;
      font-weight: 700;
      @include pc {
        padding: rem(20) rem(50);
        font-size: rem(18);
      }
      @include sp {
        padding: rem(15) rem(10);
        font-size: rem(16);
      }
    }
  }
}
</style>

<script setup lang="ts">
const emit = defineEmits<{
  (e: "close"): void;
}>();

const navData = [
  {
    label: "トップ",
    path: "/",
  },
  {
    label: "あサカの目について",
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
        <NuxtLink :to="data.path" class="u-ff-maru" @click="emit('close')">{{
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
    gap: 2em;

    li {
      display: flex;
      align-items: center;
      font-weight: 700;
      gap: 0.5em;
      &::before {
        content: "→";
        font-size: 90%;
        display: block;
        transition: transform 0.3s;
      }

      &:has(a:hover) {
        &::before {
          transform: scale(1.3);
        }
      }
    }

    a {
      position: relative;
      @include pc {
        font-size: rem(18);
      }
      @include sp {
        font-size: rem(16);
      }

      &::after {
        content: "";
        display: block;
        width: 100%;
        height: 1px;
        background-color: var(--base-fc);
        position: absolute;
        bottom: 0;
        left: 0;
        transform-origin: left center;
        transform: scaleX(0);
        transition: 0.3s;
      }

      @media (hover: hover) {
        &:hover {
          &::after {
            transform: scaleX(1);
          }
        }
      }
    }
  }
}
</style>

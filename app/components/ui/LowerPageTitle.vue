<script setup lang="ts"></script>

<template>
  <div class="lower-page-title">
    <h2 class="u-ff-maru"><slot /></h2>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/scss/variable" as *;
@use "@/assets/scss/mixin/" as *;
@use "@/assets/scss/component/utiltyPlaceholders";
@use "sass:math";
.lower-page-title {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  @include pc {
    height: rem(300);
    font-size: rem(32);
  }
  @include sp {
    height: rem(200);
    font-size: rem(24);
    padding-inline: rem(20);
  }
}
</style>

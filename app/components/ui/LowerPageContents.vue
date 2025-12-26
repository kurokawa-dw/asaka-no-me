<script setup lang="ts"></script>

<template>
  <div class="lower-page-contents">
    <slot />
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/scss/variable" as *;
@use "@/assets/scss/mixin/" as *;
@use "@/assets/scss/component/utiltyPlaceholders";
@use "sass:math";
.lower-page-contents {
  margin-inline: auto;
  @include pc {
    width: rem($pcBaseW);
    padding-bottom: rem(40);
  }
  @include sp {
    padding: 0 rem(20) rem(0);
  }
}
</style>

<script setup lang="ts">
import YearNow from "~/components/parts/YearNow.vue";

const year = String(new Date().getUTCFullYear());
</script>

<template>
  <footer class="footer">
    <p class="copyright">
      <span class="copy">&copy;</span>
      <ClientOnly :fallback="year"><YearNow /></ClientOnly> asaka-no-me
    </p>
  </footer>
</template>

<style lang="scss" scoped>
@use "@/assets/scss/variable" as *;
@use "@/assets/scss/mixin/" as *;
@use "@/assets/scss/component/utiltyPlaceholders";
@use "sass:math";
.footer {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  @include pc {
    height: 80px;
  }

  @include sp {
    height: rem(50);
  }
}

.copyright {
  text-align: center;
  @include pc {
    font-size: 12px;
  }

  @include sp {
    font-size: rem(10);
  }

  .copy {
    vertical-align: -1px;
  }
}
</style>

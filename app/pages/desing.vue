<script setup lang="ts"></script>

<template>
  <main class="l-main">
    <p class="logo">
      <span class="asaka">アサカ</span><span class="no">の</span
      ><span class="me">目👁️👁️</span>
    </p>
    <div class="sub-ttl">
      <p>朝霧じゃないよ朝霞だよ</p>
      <p>目黒川じゃないよ黒目川だよ</p>
      <p>ASKAじゃないよASAKAだよ</p>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use "@/assets/scss/variable" as *;
@use "@/assets/scss/mixin/" as *;
@use "@/assets/scss/component/utiltyPlaceholders";
@use "sass:math";

.logo {
  width: max-content;
  margin-inline: auto;
  font-size: rem(50);
  font-family: var(--font-serif-jp);
  font-weight: 700;
  .asaka {
    font-size: 75%;
  }
  .no {
    font-size: 50%;
  }
}
.sub-ttl {
  text-align: center;
}
</style>

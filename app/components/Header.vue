<script setup lang="ts"></script>

<template>
  <header class="l-header">
    <p class="logo">
      <span class="asaka">アサカ</span><span class="no">の</span
      ><span class="me">目👁️👁️</span>
    </p>
    <div class="sub-ttl">
      <p>朝霧じゃないよ朝霞だよ</p>
      <p>目黒川じゃないよ黒目川だよ</p>
      <p>ASKAじゃないよASAKAだよ</p>
    </div>
  </header>
</template>

<style scoped lang="scss">
@use "@/assets/scss/variable" as *;
@use "@/assets/scss/mixin/" as *;
@use "@/assets/scss/component/utiltyPlaceholders";
@use "sass:math";

.l-header {
  border-bottom: 1px solid #bdbdbd;
  padding-bottom: rem(10);
}

.logo {
  width: max-content;
  margin-inline: auto;
  font-family: var(--font-serif-jp);
  font-weight: 700;
  .asaka {
    font-size: 75%;
  }
  .no {
    font-size: 50%;
  }

  @include pc {
    font-size: rem(50);
  }
  @include sp {
    font-size: rem(30);
  }
}
.sub-ttl {
  text-align: center;
  display: flex;
  white-space: nowrap;
  justify-content: center;
  p {
    width: max-content;
  }
  font-size: rem(10);
}
</style>

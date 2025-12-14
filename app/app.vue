<template>
  <NuxtLayout>
    <div class="page-contents">
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
    // width: rem(1280);
    // margin: rem(100) auto 0;
  }

  @include sp {
    padding: rem(20);
  }
}
</style>

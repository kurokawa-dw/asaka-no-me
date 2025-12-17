<script setup lang="ts">
const { $ScrollTrigger } = useNuxtApp();
const route = useRoute();
const logoRef = ref(null);

const eventScrollTrigger = (el: HTMLElement, triggerEl: HTMLElement) => {
  $ScrollTrigger.create({
    trigger: triggerEl,
    start: "top 20%",
    end: "max",
    onEnter: () => (logoView.value = true),
    onLeave: () => (logoView.value = true),
    onLeaveBack: () => (logoView.value = false),
  });
};

const isTopPage = computed(() => {
  return route.path === "/";
});
const logoView = ref(false);

const mount = useMountStore();

watch(
  () => mount.mounted.todayEvent,
  (v) => {
    if (!v) return;
    const triggerEl = document.querySelector<HTMLElement>(
      '[data-trigger="todayEvent"]'
    );

    if (!triggerEl || !logoRef.value) return;

    eventScrollTrigger(logoRef.value, triggerEl);
  },
  { immediate: true }
);
</script>

<template>
  <header class="l-header">
    <p
      ref="logoRef"
      class="l-header__logo"
      :class="{ 'is-lower': !isTopPage, 'is-active': logoView }"
    >
      <NuxtLink to="/"
        ><img src="/images/common/logo.svg" alt="朝霞の目"
      /></NuxtLink>
    </p>

    <button class="l-header__hum-btn"><span v-for="el in 3"></span></button>
  </header>
</template>

<style scoped lang="scss">
@use "@/assets/scss/variable" as *;
@use "@/assets/scss/mixin/" as *;
@use "@/assets/scss/component/utiltyPlaceholders";
@use "sass:math";

.l-header {
  &__logo {
    position: fixed;
    z-index: 10;
    transition: transform 0.5s $easeOutQuart;

    @include pc {
      width: rem(120);
      top: rem(30);
      left: rem(30);
      transform: translateY(-200%);
    }

    @include sp {
      width: rem(80);
      top: rem(15);
      left: rem(15);
    }
    &.is-lower {
      transform: translateY(0);
    }

    &.is-active {
      transform: translateY(0);
    }
  }

  &__hum-btn {
    display: block;
    position: fixed;
    z-index: 100;
    cursor: pointer;
    @include pc {
      width: rem(35);
      height: rem(25);
      right: rem(30);
      top: rem(30);
    }
    @include sp {
      width: rem(20);
      height: rem(15);
      right: rem(20);
      top: rem(20);
    }

    span {
      display: block;
      width: 100%;
      height: rem(1);
      background-color: #000;
      position: absolute;
      margin: auto;
      &:nth-child(1) {
        top: 0;
      }
      &:nth-child(2) {
        top: 0;
        bottom: 0;
      }
      &:nth-child(3) {
        bottom: 0;
      }
    }
  }
}
</style>

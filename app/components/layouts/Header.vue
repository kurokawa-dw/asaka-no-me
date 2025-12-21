<script setup lang="ts">
import Logo from "~/assets/img/logo.svg";
const { $ScrollTrigger } = useNuxtApp();
const route = useRoute();

const eventScrollTrigger = (triggerEl: HTMLElement) => {
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

    if (!triggerEl) return;

    eventScrollTrigger(triggerEl);
  },
  { immediate: true }
);

const navOp = ref(false);

const navToggle = () => {
  navOp.value = !navOp.value;

  if (navOp.value) {
    document.body.classList.add("is-nav-op");
  } else {
    document.body.classList.remove("is-nav-op");
  }
};

const closeNav = () => {
  navOp.value = false;

  document.body.classList.remove("is-nav-op");
};
</script>

<template>
  <div
    class="header"
    :class="{ 'is-lower': !isTopPage, 'is-active': logoView || navOp }"
  >
    <p
      class="header__logo"
      :class="{ 'is-lower': !isTopPage, 'is-active': logoView || navOp }"
    >
      <NuxtLink to="/" @click="closeNav"><Logo /></NuxtLink>
    </p>

    <button
      class="header__hum-btn"
      :class="{ 'is-nav-op': navOp }"
      @click="navToggle"
    >
      <span v-for="el in 3"></span>
    </button>
  </div>
  <LayoutsNav class="l-nav" :class="{ 'is-nav-op': navOp }" @close="closeNav" />
</template>

<style scoped lang="scss">
@use "@/assets/scss/variable" as *;
@use "@/assets/scss/mixin/" as *;
@use "@/assets/scss/component/utiltyPlaceholders";
@use "sass:math";

.header {
  width: 100%;
  background-color: #fff;
  display: grid;
  grid-template-columns: auto auto;
  justify-content: space-between;
  align-items: center;
  top: 0;
  left: 0;
  position: fixed;
  z-index: 100;
  @include pc {
    padding: 0 rem(30);
    height: rem(80);
  }
  @include sp {
    padding: 0 rem(20);
    height: rem(50);
  }

  &.is-lower {
    border-bottom: 1px solid #ccc;
  }
  &.is-active {
    border-bottom: 1px solid #ccc;
  }

  &__logo {
    transition: transform 0.5s $easeOutQuart;
    transform: translateY(-250%);
    aspect-ratio: 375 / 85;

    @include pc {
      width: rem(120);
    }

    @include sp {
      width: rem(80);
    }
    &.is-lower {
      transform: translateY(0);
    }

    &.is-active {
      transform: translateY(0);
      transition: transform 1.2s $easeOutQuart;
    }

    svg {
      width: 100%;
      height: 100%;
      display: block;
      margin-bottom: 0;
    }
  }

  &__hum-btn {
    display: block;
    position: relative;
    cursor: pointer;
    @include pc {
      width: rem(35);
      height: rem(25);
    }
    @include sp {
      width: rem(25);
      height: rem(20);
    }

    span {
      display: block;
      width: 100%;
      height: rem(1);
      background-color: #000;
      position: absolute;
      margin: auto;
      transition: transform 0.5s;
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

    &.is-nav-op {
      span {
        &:nth-child(1) {
          bottom: 0;
          transform: rotate(135deg);
        }
        &:nth-child(2) {
          opacity: 0;
        }
        &:nth-child(3) {
          top: 0;
          transform: rotate(-135deg);
        }
      }
    }
  }
}

.l-nav {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;

  &.is-nav-op {
    opacity: 1;
    pointer-events: auto;
  }
}
</style>

<script setup lang="ts">
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
  <div class="header">
    <p
      class="header__logo"
      :class="{ 'is-lower': !isTopPage, 'is-active': logoView || navOp }"
    >
      <NuxtLink to="/" @click="closeNav"
        ><img src="/images/common/logo.svg" alt="朝霞の目"
      /></NuxtLink>
    </p>

    <button
      class="header__hum-btn"
      :class="{ 'is-nav-op': navOp }"
      @click="navToggle"
    >
      <span v-for="el in 3"></span>
    </button>

    <LayoutsNav
      class="l-nav"
      :class="{ 'is-nav-op': navOp }"
      @close="closeNav"
    />
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/scss/variable" as *;
@use "@/assets/scss/mixin/" as *;
@use "@/assets/scss/component/utiltyPlaceholders";
@use "sass:math";

.header {
  &__logo {
    position: fixed;
    z-index: 100;
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
      transition: transform 1s $easeOutQuart;
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
      width: rem(25);
      height: rem(20);
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

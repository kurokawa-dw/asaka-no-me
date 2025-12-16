<script setup lang="ts">
const { $gsap } = useNuxtApp();

const tpRef = ref<HTMLAllCollection | null>(null);
onMounted(() => {
  // const tp = document.querySelector("#tp");

  if (!tpRef.value) return;

  // 1) 表示したい文字列（ここを書き換え）
  const base =
    "目黒川じゃなくて黒目川だよ | あサカの目  |  イベントカレンダー | 目黒川じゃなくて黒目川だよ | 朝霞の目 |  Asaka-no-me  |  ";

  // 2) 2回連結（これで「最後の後ろに最初がいる」状態を作る）
  tpRef.value!.textContent = base + base + base + base;

  // 3) textPathの“見た目上の長さ（px）”を取得
  // getComputedTextLength() は <textPath> でも取れます
  const total = tpRef.value!.getComputedTextLength();
  const half = total / 2; // 2回連結したので、1周分は半分

  $gsap.fromTo(
    tpRef.value,
    { attr: { startOffset: 0 } },
    {
      attr: { startOffset: -half }, // 左→右/右→左は符号で調整
      duration: 40, // 速度（秒）
      ease: "none",
      repeat: -1,
    }
  );
});
</script>

<template>
  <div class="kv">
    <h1 class="kv__logo">
      <img src="/images/common/logo.svg" alt="朝霞の目" />
    </h1>
    <h2 class="kv__copy u-ff-maru">
      〜勝手に朝霞のイベントまとめちゃう〜<br />非公式
    </h2>

    <div class="kv__river">
      <svg id="river-flow" viewBox="0 0 702.65 404.93">
        <path
          id="flowPath"
          d="M15.69,367.08c91.26-124.08,205.83-29.74,300.02-128.5,97.41-105.05,245.28-21.48,373.36-194.24"
          style="fill: none"
        />
        <path
          id="topPath"
          d="M2,324.74c86.51-122.54,202.61-23.45,295.26-126.96,92.66-103.51,246.82-16.72,378.12-195.78"
          style="fill: none; stroke: #000; stroke-linecap: round"
        />
        <path
          id="bottomPath"
          d="M27.27,402.93c96.02-125.62,209.05-36.04,304.78-130.04,102.17-106.59,243.75-26.23,368.6-192.7"
          style="fill: none; stroke: #000; stroke-linecap: round"
        />
        <text fill="#000" opacity="0.9">
          <textPath
            ref="tpRef"
            id="tp"
            href="#flowPath"
            startOffset="0"
          ></textPath>
        </text>
      </svg>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/scss/variable" as *;
@use "@/assets/scss/mixin/" as *;
@use "@/assets/scss/component/utiltyPlaceholders";
@use "sass:math";

.kv {
  // aspect-ratio: 1440 / 500;
  // height: 600px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: rem(40);
  position: relative;
  @include pc {
    padding: rem(150) 0;
  }
  @include sp {
    padding: rem(100) 0;
  }
  &__logo {
    @include pc {
      width: rem(404);
    }
    @include sp {
      width: rem(200);
    }
  }

  &__copy {
    font-weight: 700;
    letter-spacing: 0.15em;
    text-align: center;
    font-size: rem(14);
    @include pc {
    }
    @include sp {
      // font-size: rem(10);
    }
  }

  &__river {
    // opacity: 0.5;
    aspect-ratio: 500 / 288;
    position: absolute;
    // font-family: "Zen Maru Gothic", sans-serif;

    @include pc {
      width: rem(500);
      right: rem(5);
      bottom: rem(-0);
      font-size: rem(12);
    }

    @include sp {
      width: rem(400);
      bottom: rem(-90);
    }

    svg {
      path {
        stroke-width: 1px;
      }
    }
  }
}
</style>

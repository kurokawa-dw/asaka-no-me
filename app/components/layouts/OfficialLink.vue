<script setup lang="ts">
import IconWeb from "~/assets/img/icon-web.svg";
import IconInstagram from "~/assets/img/icon-instagram-grad.svg";
import IconFacebook from "~/assets/img/icon-facebook.svg";
import IconYoutube from "~/assets/img/icon-youtube.svg";
import IconX from "~/assets/img/icon-x.svg";

const linkData = [
  {
    label: "埼玉県朝霞市公式ホームページ",
    url: "https://www.city.asaka.lg.jp/",
    cat: "web",
  },
  {
    label: "朝霞市 都市建設部【公式】",
    url: "https://www.instagram.com/toshikensetsu_asaka/",
    cat: "instagram",
  },
  {
    label: "アサカストリートテラス(あさかエリアデザイン会議)",
    url: "https://www.instagram.com/asaka_street_terrace/",
    cat: "instagram",
  },
  {
    label: "朝霞市 シティ・プロモーション課【公式】",
    url: "https://www.instagram.com/asaka_city.promotion/",
    cat: "instagram",
  },
  {
    label: "朝霞駅前商店会",
    url: "https://www.instagram.com/asakaekimaesyoutenkai/",
    cat: "instagram",
  },
  {
    label: "【公式】朝霞市 産業振興課",
    url: "https://www.instagram.com/sangyo_asaka/",
    cat: "instagram",
  },
  {
    label: "ASAKA B.B.SQUARE【公式】",
    url: "https://www.instagram.com/b.b.square_asaka/",
    cat: "instagram",
  },
  {
    label: "朝霞奇天烈 ASAKA KITERETSU",
    url: "https://www.instagram.com/kiteretsu.pro/",
    cat: "instagram",
  },
];
</script>

<template>
  <div class="official-link">
    <p class="ttl-label u-ff-maru">公式リンク</p>

    <ul class="list">
      <li v-for="item in linkData" :key="item.url">
        <a :href="item.url" class="u-hv-underline" target="_blank">
          <i
            class="icon"
            :class="{
              web: item.cat === 'web',
              instagram: item.cat === 'instagram',
              facebook: item.cat === 'facebook',
              x: item.cat === 'x',
              youtube: item.cat === 'youtube',
            }"
          >
            <template v-if="item.cat === 'instagram'"
              ><img src="~/assets/img/icon-instagram-grad.png"
            /></template>
            <template v-else-if="item.cat === 'facebook'"
              ><IconFacebook
            /></template>
            <template v-else-if="item.cat === 'x'"><IconX /></template>
            <template v-else-if="item.cat === 'youtube'"
              ><IconYoutube
            /></template>
            <template v-else="item.cat === 'web'"><IconWeb /></template>
          </i>
          {{ item.label }}
        </a>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/scss/variable" as *;
@use "@/assets/scss/mixin/" as *;
@use "@/assets/scss/component/utiltyPlaceholders";
@use "sass:math";

.official-link {
  border: 1px solid var(--c-border);
  margin: 0 auto;
  position: relative;

  @include pc {
    padding: rem(40);
    border-radius: rem(20);
    width: rem($pcBaseW);
  }
  @include sp {
    width: rem($spBaseW);
    padding: rem(30);
    border-radius: rem(20);
  }
}

.ttl-label {
  width: max-content;
  background-color: #fff;
  margin: auto;
  font-weight: 700;
  padding: rem(10) rem(20);
  font-size: rem(20);
  position: absolute;
  // inset-inline: 0;
  left: rem(20);
  top: rem(-27);
}

.list {
  @include pc {
    display: grid;
    gap: rem(20) rem(30);
    grid-template-columns: auto auto auto;
  }
  @include sp {
    display: flex;
    flex-direction: column;
    gap: rem(10);
  }
  a {
    font-weight: 700;
    display: grid;
    align-items: center;
    @include pc {
      grid-template-columns: rem(20) 1fr;
      gap: rem(5);
      font-size: rem(14);
    }
    @include sp {
      grid-template-columns: rem(16) 1fr;
      gap: rem(5);
      font-size: rem(12);
    }
    .icon {
      display: flex;
      align-items: center;
      svg,
      img {
        display: block;
        width: 100%;
      }
    }
  }
}
</style>

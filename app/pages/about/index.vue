<script setup lang="ts">
const notes = [
  "間違った情報が掲載されていた場合はお問い合わせください。",
  "ページ下部に朝霞市の公式リンクがございますので合わせてご確認ください。",
  "ご意見などございましたらお問い合わせください。。",
  "誹謗中傷などのお問い合わせはご遠慮ください。",
  "順箱の隅をつつくようなお問い合わせはご遠慮ください。",
];

////////////////////////////////////////////////////////////
useSeoHead({
  title: "あサカの目について",
});
////////////////////////////////////////////////////////////
</script>

<template>
  <div class="about-page">
    <UiLowerPageTitle>あサカの目について👀</UiLowerPageTitle>
    <UiLowerPageContents class="about-page__contents">
      <div class="about-page__how">
        <p>
          「あサカの目」とは、朝霞市民による朝霞市民のための朝霞市のイベントをまとめたサイトです。
          <br />
          <br />
          朝霞市って彩夏祭以外にもキッチンカーが来ていたり、黒目川、シンボルロード、駅前などで結構イベントが行われいるの知っていますか？？
          <br />
          <br />
          朝霞市の公式サイトやインスタグラムで発信されてはいるのですが、全てのイベントを一覧できるサイトやSNSがないので知らない間に「知ってれば行きたかった...」というイベントもあるのではないでしょうか？<br />

          僕自身、何か催し物があるならお散歩がてらチラッと行きたかったなぁ、なんて思うこともしばしば。ただあちこちのインスタアカウントを漁るのも面倒じゃないですか。
          じゃーこの際自分でイベントまとめサイトを作ってしまおうと思って立ち上げました。
          <br />
          <br />
          なのでこのサイト「あサカの目」は朝霞市公認のサイトではございません。あくまで個人ブログのような非公式サイトですので100%正しい情報とは限りません。日付やイベント名が間違っていることもあるかもしれません。イベントが急に中止になった場合など更新が追いついていないこともあると思います。ただし嘘やデマを載せる気は一切なく、できるだけたくさんの人に見ていただけるよう頑張って更新していきますので、是非朝霞市のイベントを楽しんでください。
          <br /><br />
          そして朝霞市さん大目に見てください！<span class="large">🙇‍♂️</span>
        </p>
      </div>
      <UiNoteList class="about-page__note-list" :notes="notes" />

      <section class="about-page__admin">
        <h3 class="title">あサカの目の管理人</h3>
        <div class="text">
          <p>
            「Kurokawa Design
            Works」という屋号でフリーランスwebエンジニアをやっているものです。
            <br class="view-pc" />
            もちろん朝霞市在住です。好きなスポットは黒目川。<br
              class="view-pc"
            />黒目川は目黒川より楽しいと本気で思っています。
          </p>
        </div>
        <div class="img">
          <div class="img__inner">
            <NuxtImg :src="`/images/about/icon_pizzaboy.png`" format="webp" />
          </div>
        </div>
      </section>
    </UiLowerPageContents>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/scss/variable" as *;
@use "@/assets/scss/mixin/" as *;
@use "@/assets/scss/component/utiltyPlaceholders";
@use "sass:math";

.about-page {
  &__contents {
    line-height: 2;
    letter-spacing: 0.05em;
    @include pc {
      width: rem(800);
    }
  }

  &__how {
    .large {
      font-size: 150%;
    }
  }

  &__note-list {
    @include pc {
      margin-top: rem(100);
    }
    @include sp {
      margin-top: rem(50);
    }
  }
  &__admin {
    position: relative;
    @include pc {
      margin: rem(150) auto 0;
      display: grid;
      grid-template-columns: rem(430) 1fr;
      grid-template-rows: auto auto;
      gap: rem(30) rem(30);
      align-items: center;
      width: rem(600);
    }

    @include sp {
      margin: rem(100) auto 0;
      width: rem(280);
    }

    &::before,
    &::after {
      content: "";
      display: block;
      background-color: var(--c-border);
      position: absolute;
      width: 1px;
      height: 1px;
    }
    &::before {
      width: 100%;
      @include pc {
        top: rem(45);
        transform: scaleX(1.3);
      }
      @include sp {
        top: rem(35);
        transform: scaleX(1.3);
      }
    }
    &::after {
      @include pc {
        top: rem(-10);
        left: rem(-30);
        height: calc(100% + rem(20));
      }
      @include sp {
        top: rem(-7);
        left: rem(-18);
        height: calc(100% + rem(14));
      }
    }

    .title {
      font-weight: 700;
      grid-column: span 2;
      @include pc {
        font-size: rem(16);
      }
      @include sp {
        font-size: rem(14);
        margin-bottom: rem(20);
      }
    }
    .text {
      @include pc {
        font-size: rem(16);
      }
      @include sp {
        font-size: rem(14);
        line-height: 1.8;
      }
    }

    .img {
      border-radius: rem(20);
      border: 1px solid #000;
      padding: rem(4);
      @include sp {
        width: rem(150);
        margin: rem(20) auto 0;
      }
      &__inner {
        border-radius: rem(15);
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }
}
</style>

<script setup lang="ts">
const props = defineProps<{
  allTags: string[];
  selectedTag: string | null;
}>();

const emit = defineEmits<{
  (e: "update:selectedTag", value: string | null): void;
}>();

const setTag = (tag: string | null) => emit("update:selectedTag", tag);
</script>

<template>
  <section class="section-tag-filter">
    <h2 class="ttl-label u-ff-maru">#確認したいジャンルを絞り込めるよ！</h2>

    <div class="tag-filter">
      <button
        type="button"
        :class="{ 'is-active': props.selectedTag === null }"
        class="button"
        @click="setTag(null)"
      >
        <span class="button__label">すべて!</span>
      </button>

      <button
        v-for="tag in props.allTags"
        :key="tag"
        type="button"
        :class="{ 'is-active': props.selectedTag === tag }"
        class="button"
        @click="setTag(tag)"
      >
        <span class="button__label">#{{ tag }}</span>
      </button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use "@/assets/scss/variable" as *;
@use "@/assets/scss/mixin/" as *;
@use "@/assets/scss/component/utiltyPlaceholders";
@use "sass:math";
.section-tag-filter {
  margin-inline: auto;
  @include pc {
    max-width: rem($pcBaseW);
    margin-top: rem(20);
  }
  @include sp {
    width: rem($spBaseW);
  }
}
.ttl-label {
  font-weight: 700;
  text-align: center;
}

.tag-filter {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  @include pc {
    margin-top: rem(20);
    gap: rem(10);
  }
  @include sp {
    margin-top: rem(5);
    gap: rem(8);
  }

  .button {
    border: 1px solid #000;
    width: fit-content;
    border-radius: rem(5);
    @include pc {
      padding: rem(8) rem(20);
      font-size: rem(14);
    }
    @include sp {
      padding: rem(5) rem(15);
    }

    &.is-active {
      background-color: var(--c-yellow);
    }
    &__label {
      width: max-content;
      font-weight: 700;
    }
  }
}
</style>

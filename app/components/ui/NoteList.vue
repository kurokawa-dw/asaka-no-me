<script setup lang="ts">
const props = defineProps<{
  notes: string[];
}>();
</script>

<template>
  <ul class="note-list">
    <li v-for="(item, index) in props.notes" :key="index">
      {{ item }}
    </li>
  </ul>
</template>

<style scoped lang="scss">
@use "@/assets/scss/variable" as *;
@use "@/assets/scss/mixin/" as *;
@use "@/assets/scss/component/utiltyPlaceholders";
@use "sass:math";
.note-list {
  display: flex;
  flex-direction: column;
  @include sp {
    gap: 0.3em;
  }
  li {
    padding-left: 1em;
    position: relative;
    @include pc {
      font-size: rem(12);
    }
    @include sp {
      // font-size: rem(12);
      font-size: 12px;
      line-height: 1.5;
    }
    &::before {
      content: "※";
      display: block;
      position: absolute;
      left: 0;
    }
  }
}
</style>

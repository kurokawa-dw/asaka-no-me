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
  li {
    padding-left: 1em;
    font-size: rem(12);
    position: relative;
    @include pc {
    }
    @include sp {
      line-height: 1.8;
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

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
    <h2>タグで絞り込む</h2>

    <div class="tag-filter">
      <button
        type="button"
        :class="{ 'is-active': props.selectedTag === null }"
        @click="setTag(null)"
      >
        すべて
      </button>

      <button
        v-for="tag in props.allTags"
        :key="tag"
        type="button"
        :class="{ 'is-active': props.selectedTag === tag }"
        @click="setTag(tag)"
      >
        {{ tag }}
      </button>
    </div>
  </section>
</template>

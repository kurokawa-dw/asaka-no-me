export const useMountStore = defineStore("mount", () => {
  const mounted = reactive<Record<string, boolean>>({});
  const setMounted = (key: string, v: boolean) => (mounted[key] = v);
  return { mounted, setMounted };
});

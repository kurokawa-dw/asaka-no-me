export default defineNuxtPlugin(async () => {
  // すべてクライアントで動的import（SSRで評価しない）
  const { gsap } = await import("gsap"); // ← named import
  const { ScrollTrigger } = await import("gsap/ScrollTrigger"); // ← named import
  const { ScrollToPlugin } = await import("gsap/ScrollToPlugin");
  const { TextPlugin } = await import("gsap/TextPlugin");
  const { Physics2DPlugin } = await import("gsap/Physics2DPlugin");
  const { MotionPathPlugin } = await import("gsap/MotionPathPlugin");

  gsap.registerPlugin(
    ScrollTrigger,
    ScrollToPlugin,
    TextPlugin,
    Physics2DPlugin,
    MotionPathPlugin
  );
  return {
    provide: { gsap, ScrollTrigger },
  };
});

// 普通のCSS import（副作用import）を許可
declare module "*.css";
declare module "*.scss";
declare module "*.sass";
declare module "*.less";
declare module "*.styl";

// ライブラリが `something.css?inline` みたいなのを使うケースも吸収（Vite系）
declare module "*.css?inline";
declare module "*.scss?inline";
declare module "*.sass?inline";
declare module "*.less?inline";
declare module "*.styl?inline";

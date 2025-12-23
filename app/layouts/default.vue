<template>
  <div id="container">
    <header class="l-header">
      <LayoutsHeader />
    </header>
    <main class="l-main">
      <slot />
    </main>
    <footer class="l-footer">
      <LayoutsOfficialLink />
      <LayoutsFooter />
    </footer>
  </div>
</template>

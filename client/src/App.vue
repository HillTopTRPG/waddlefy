<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script lang="ts" setup>
const images: HTMLImageElement[] = []
function preload(...args: string[]) {
  for (let i = 0; i < args.length; i++) {
    const imgElm = new Image()
    const src = arguments[i]
    imgElm.onload = () => {
      window.logger.info(`preloaded '${src}'`)
    }
    imgElm.src = src
    images.push(imgElm)
  }
}

preload(
  '/paint_00001.jpg',
  '/paint_00003.jpg',
  '/paint_00005.jpg',
  '/paint_00007.jpg',
  '/paint_00019.jpg',
  '/paint_00022.jpg',
  '/white_00053.jpg'
)
</script>

<style lang="scss">
html {
  overscroll-behavior-x: none;
  overscroll-behavior-y: none;
  overflow-y: hidden !important;
}

$body-font-family: 'M PLUS Rounded 1c', sans-serif !important;

// Vuetifyが提供しているTypography系のoptions一覧
$vuetifyTypographyOptions: text-h1, text-h2, text-h3, text-h4, text-h5, text-h6, text-headline, text-title,
  text-subtitle-1, text-subtitle-2, text-body-1, text-body-2, text-button, text-caption, text-overline;

// テキスト関係のHTMLタグ一覧
$htmlTags: div, span, h1, h2, h3, h4, h5, h6, p, pre, a, abbr, address, code, small, strike, strong, center, dl, dt, dd,
  ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article;

#app {
  font-family: $body-font-family;

  // Vuetifyのtypography option使用箇所にすべて指定のfont-familyを上書きする
  @each $vuetifyTypographyOption in $vuetifyTypographyOptions {
    .#{$vuetifyTypographyOption} {
      font-family: $body-font-family;
    }
  }

  // HTMLタグ使用箇所にすべて指定のfont-familyを上書きする
  @each $htmlTag in $htmlTags {
    #{$htmlTag} {
      font-family: $body-font-family;
    }
  }

  li > ul {
    margin-left: 1em;
  }
}

textarea {
  font-family: 'M PLUS Rounded 1c', sans-serif !important;
}

.ellipsis {
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scrollbar-hide {
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.set-theme-surface-color {
  background-color: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
}

.no-transition {
  transition-duration: 0s !important;
}
</style>

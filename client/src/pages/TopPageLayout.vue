<template>
  <v-app-bar density="default" color="primary" class="text-center">
    <v-spacer />
    <v-app-bar-nav-icon :flat="true" :ripple="false" class="bg-white pa-1 align-self-center" style="pointer-events: none">
      <logo-component color="#333" width="35px" height="35px" :stroke-width="0.7" />
    </v-app-bar-nav-icon>
    <ruby class="text-h5 ml-2" style="ruby-position: over">Waddlefy<rt>ワドルフィ</rt></ruby>
    <v-spacer />
  </v-app-bar>

  <v-main class="">
    <v-container class="top-back d-flex flex-row justify-center pa-0 h-100">
      <v-sheet
        class="d-flex flex-column align-center overflow-y-auto align-self-stretch pt-2"
        :class="xs ? 'top-back-content-xs' : 'top-back-content'"
      >
        <slot />
      </v-sheet>
    </v-container>
  </v-main>

  <v-bottom-navigation>
    <v-divider vertical />
    <v-btn
      prepend-icon="mdi-wikipedia"
      text="ドキュメント"
      href="https://github.com/HillTopTRPG/waddlefy/wiki"
      target="_blank"
      rel="noopener noreferrer"
    />
    <v-divider vertical />
    <v-btn
      prepend-icon="mdi-history"
      text="リリースノート"
      href="https://github.com/HillTopTRPG/waddlefy/releases"
      target="_blank"
      rel="noopener noreferrer"
    />
    <v-divider vertical />
  </v-bottom-navigation>
</template>

<script lang="ts" setup>
import LogoComponent from '@/components/parts/LogoComponent.vue'
import { useDisplay } from 'vuetify'

const { xs } = useDisplay()
</script>

<style>
.top-back {
  &:before {
    content: '';
    z-index: 0;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-image: url('/p_da0691_m_da06910.png');
    background-repeat: repeat;
    opacity: 0.3;
  }
}

.top-back-content {
  z-index: 2;
  padding: 0 12em;
  background: linear-gradient(to right, transparent, #eee 8em, #eee 34em, transparent);
}

.top-back-content-xs {
  z-index: 2;
  justify-self: stretch;
  width: 100%;
  padding: 0 2em;
  background: linear-gradient(to right, transparent, #eee 4em, #eee calc(100% - 4em), transparent);
}
</style>

<template>
  <v-app-bar density="default" color="primary" class="text-center">
    <v-spacer />
    <v-app-bar-nav-icon flat :ripple="false" class="bg-white pa-1 align-self-center">
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
        <v-sheet class="d-flex flex-column align-center bg-transparent mb-3" style="gap: 0.3rem">
          <a
            href="https://github.com/HillTopTRPG/waddlefy/releases"
            class="d-flex"
            target="_blank"
            rel="noreferrer noopener"
          >
            <img
              alt="Application Version"
              src="https://img.shields.io/github/v/release/HillTopTRPG/waddlefy?style=plastic&label=version"
              height="20"
            />
          </a>
          <a href="https://github.com/sponsors/HillTopTRPG" class="d-flex" target="_blank" rel="noopener noreferrer">
            <img
              alt="GitHub Sponsors"
              src="https://img.shields.io/github/sponsors/HillTopTRPG?style=plastic&logo=github&label=%E3%82%B9%E3%83%9D%E3%83%B3%E3%82%B5%E3%83%BC"
              height="18"
            />
          </a>
        </v-sheet>
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

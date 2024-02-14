<template>
  <v-card variant="text" class="w-100">
    <v-card-title class="px-0 pb-5">永い後日談のネクロニカ専用機能にようこそ！</v-card-title>
    <v-card-text class="text-body-1 px-0 py-2 d-flex flex-column align-start">
      <span>この「キャラクター閲覧」画面はメインの画面です。</span>
    </v-card-text>
    <v-card-item class="text-caption pa-0"
      >※ キャラクターが登録されることで、この画面にキャラクター情報が表示されます。</v-card-item
    >

    <v-spacer class="my-6" />

    <v-card-text class="text-body-1 px-0 py-2 d-flex flex-column align-start">
      <span>皆様のセッションの成功のため、資料をご用意しました。</span>
    </v-card-text>

    <v-card-item class="pa-0">
      <v-sheet class="d-flex flex-column flex-wrap align-start bg-transparent">
        <p class="text-caption">
          まずは次の資料でセッションの準備の仕方からセッション中の操作までを一通り確認しておきましょう。
        </p>
        <link-text
          href="https://github.com/HillTopTRPG/waddlefy/wiki/%E4%BD%BF%E3%81%84%E6%96%B9-%E2%80%90-%E3%83%8D%E3%82%AF%E3%83%AD%E3%83%8B%E3%82%AB%E5%B0%82%E7%94%A8%E6%A9%9F%E8%83%BD"
          src="https://img.shields.io/badge/wiki-%E3%83%8D%E3%82%AF%E3%83%AD%E3%83%8B%E3%82%AB%E5%B0%82%E7%94%A8%E6%A9%9F%E8%83%BD-mediumslateblue?style=for-the-badge&logo=github"
          alt="Static Badge"
          style="border-radius: 0.5em"
        />
      </v-sheet>
    </v-card-item>
    <v-spacer class="mt-3" />
    <v-card-item class="pa-0">
      <v-sheet class="d-flex flex-column flex-wrap align-start bg-transparent">
        <p class="text-caption">
          余裕があれば次の資料でWaddlefyに備わっている共通機能についても一読されることをお勧めします。
        </p>
        <link-text
          href="https://github.com/HillTopTRPG/waddlefy/wiki/%E4%BD%BF%E3%81%84%E6%96%B9-%E2%80%90-%E5%85%B1%E9%80%9A%E6%A9%9F%E8%83%BD"
          src="https://img.shields.io/badge/wiki-%E5%85%B1%E9%80%9A%E6%A9%9F%E8%83%BD-blue?style=for-the-badge&logo=github"
          alt="Static Badge"
          style="border-radius: 0.5em"
        />
      </v-sheet>
    </v-card-item>
  </v-card>
</template>

<script setup lang="ts">
import LinkText from '@/components/parts/LinkText.vue'
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
ul,
ol {
  padding-left: 20px;
  margin-bottom: 2em;

  li {
    margin: 0;

    p {
      vertical-align: middle;
      white-space: pre-line;
      word-break: break-word;
    }

    &:not(:first-child) {
      margin-top: 10px;
    }
  }
}
</style>

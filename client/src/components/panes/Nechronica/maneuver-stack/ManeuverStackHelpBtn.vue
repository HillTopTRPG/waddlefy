<template>
  <v-menu :close-on-content-click="false" location="bottom left">
    <template #activator="{ props }">
      <v-btn icon="mdi-help" color="info" variant="outlined" size="small" density="comfortable" v-bind="props" />
    </template>
    <v-card>
      <v-card-title>マニューバ履歴機能について</v-card-title>
      <v-card-subtitle>この機能は？</v-card-subtitle>
      <v-card-text>
        一度に処理すべきマニューバのまとまりを表現します。<br />
        選択した履歴以降のマニューバを表示します。
      </v-card-text>
      <v-card-subtitle>「処理済みにする」ボタン</v-card-subtitle>
      <v-card-text>
        表示しているマニューバ履歴を処理済み状態にできます。<br />
        処理済みになったマニューバ履歴は処理済みマークが付き、<br>移動や個別の取り消しができなくなります。<br />
        判定などの処理を終える毎に行うことで情報を整理できます。
      </v-card-text>
      <v-card-subtitle>「取り消す」ボタン</v-card-subtitle>
      <v-card-text>
        各マニューバ履歴の操作を取り消すためのボタンです。<br />
        使用の取り消しであれば使ったコスト分の行動値も戻ります。<br />
        処理済みのマニューバ履歴からは行えません。
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
// eslint-disable-next-line unused-imports/no-unused-vars
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>

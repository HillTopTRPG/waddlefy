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
      <v-card-subtitle>「まとめて消す」ボタン</v-card-subtitle>
      <v-card-text>
        ここに表示されているマニューバ履歴を消すことができます。<br />
        このボタンでは使用・損傷の操作は取り消されません。<br />
        判定などの処理を終える毎に消すことで、情報が整理できます。
      </v-card-text>
      <v-card-subtitle>「取り消す」ボタン</v-card-subtitle>
      <v-card-text>
        各マニューバ履歴の操作を取り消すためのボタンです。<br />
        使用の取り消しであれば使ったコスト分の行動値も戻ります。
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
// eslint-disable-next-line unused-imports/no-unused-vars
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>

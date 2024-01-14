<template>
  <v-menu :close-on-content-click="false" location="bottom left">
    <template #activator="{ props }">
      <v-btn icon="mdi-help" color="info" variant="outlined" size="small" density="comfortable" v-bind="props" />
    </template>
    <v-card>
      <v-card-title>キャラ操作履歴機能について</v-card-title>
      <v-card-subtitle>この機能は？</v-card-subtitle>
      <v-card-text>
        後入れ先出しで積み上げられる宣言を整理するための機能です。<br />
        選択された履歴以降の履歴をひとまとまりとして表示しています。<br />
        少しずつ処理済みにしていくことで、進行が視覚化できます。<br />
        キャラ操作履歴機能は単なる忘備録なので、操作は省略可能です。
      </v-card-text>
      <v-card-subtitle>「処理済みにする」ボタン</v-card-subtitle>
      <v-card-text>
        表示しているキャラ操作履歴をまとめて処理済み状態にします。<br />
        処理済みにすると一連の履歴は重なり処理済みマークが付きます。<br />
        この状態になると履歴は移動や取り消しができなくなります。<br />
        マニューバの処理（損傷・移動）まで終える毎に行うと良いです。
      </v-card-text>
      <v-card-subtitle>「取り消す」ボタン</v-card-subtitle>
      <v-card-text>
        キャラ操作履歴を取り消すためのボタンです。<br />
        マニューバの使用の取り消しならマニューバは未使用状態にし、<br />
        その時使われていたコスト分の行動値も回復します。<br />
        キャラの移動の取り消しはその履歴上の変化前の値になります。<br />
        処理済み状態の履歴では行えません。
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>

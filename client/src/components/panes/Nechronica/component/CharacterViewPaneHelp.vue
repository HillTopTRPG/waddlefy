<template>
  <v-card title="永い後日談のネクロニカ専用機能にようこそ！" variant="text">
    <v-card-item class="text-h5 py-0">この「キャラクター閲覧」画面は主に使う画面です。</v-card-item>
    <v-card-item class="text-h5 py-0">表示するキャラクターがまだいないので簡単に使い方をご紹介します。</v-card-item>
    <v-card-item class="text-caption py-0"
      >※ キャラクターが登録されるとこの紹介内容の代わりにキャラクター情報が表示されます。</v-card-item
    >
    <v-card-item>
      <v-tabs v-model="currentTab">
        <v-tab variant="text" density="comfortable" text="特徴" value="features" />
        <v-tab variant="text" density="comfortable" text="おすすめの準備手順" value="preparation-steps" />
      </v-tabs>
      <v-window v-model="currentTab" class="pt-2">
        <v-window-item value="features">
          <section>
            <h3>主催者/参加者共通の機能</h3>
            <ul>
              <li>
                <p>
                  ページの更新(F5を押すなど)をすると同じ画面に戻れます（ログイン不要）<br />
                  万が一、データが反映されない、画面遷移の違和感などが発生した場合はページを更新してみてください。<br />
                  または、左側のサイドバーから違う画面を選ぶことで画面遷移をしてみると直るかもしれません。
                </p>
              </li>
              <li>
                <p>
                  各画面はツールと呼ぶパーツで構成されています。<br />
                  デフォルトで用意されている3画面はそれぞれ対応するツールをひとつずつ表示しているだけの画面です。<br />
                  （主催者は画面を追加したり既にある画面のパーツ構成を変更することができます）
                </p>
                <section class="my-2 border px-4 py-2 d-inline-block" style="border-radius: 1em">
                  <h5>プリセット画面とそれらが表示するツール</h5>
                  <ul class="mt-2 mb-0">
                    <li>
                      <span class="bg-cyan-lighten-5">キャラクター管理</span> -
                      <span class="bg-amber-lighten-5">キャラクター管理ツール</span>
                    </li>
                    <li>
                      <span class="bg-cyan-lighten-5">キャラクター閲覧</span> -
                      <span class="bg-amber-lighten-5">キャラクター閲覧ツール</span>
                    </li>
                    <li>
                      <span class="bg-cyan-lighten-5">ネクロニカ専用機能のTips</span> -
                      <span class="bg-amber-lighten-5">ネクロニカ専用機能のTips</span>
                    </li>
                  </ul>
                </section>
              </li>
              <li>
                <p>
                  <span>画面上では各ツールのタイトル部分は</span>
                  <span class="bg-amber-lighten-5 px-1">このような背景色</span>になっています。<br />
                  <span
                    >デフォルトで用意されている3画面はそれぞれ対応するツールをひとつずつ表示しているだけの画面です。</span
                  >
                </p>
              </li>
              <li><p>「キャラクター管理」画面からドールを登録できます。</p></li>
            </ul>
          </section>

          <section>
            <h3>主催者(ネクロマンサー)専用機能</h3>
            <ul>
              <li>
                <p>
                  <span>人によって見え方が変わるツールの場合、</span>
                  <span class="bg-amber-lighten-5 px-1">ツールのタイトル部分</span>
                  <span>の右端に視点の選択肢が表示されます。</span>
                  <br />
                  <span
                    >この機能によって、主催者は同じ画面が参加者からどう見えることになるのかを確認することができます。</span
                  >
                </p>
              </li>
              <li>
                <p>
                  <span>画面の右上の</span>
                  <v-btn
                    prepend-icon="mdi-pencil-ruler"
                    text="レイアウト"
                    class="px-2 bg-grey-lighten-3 h-auto"
                    variant="flat"
                    :stacked="true"
                    size="x-small"
                  />
                  <span
                    >を押してレイアウト編集モードを切り替えることで表示するツールを変更したり増やしたりすることができます。</span
                  >
                </p>
                <v-alert type="warning" color="orange-darken-1" class="overflow-x-auto">
                  <p class="d-flex flex-column">
                    <span
                      >1画面に多くのツールを詰め込むと小さいモニターを使う参加者にとっては見づらいものとなります。</span
                    >
                    <span
                      >独自のレイアウトを用意したい場合はプリセットの画面は編集せず、画面を追加して行うことをお勧めします。</span
                    >
                    <span
                      >追加した画面では右上の画面の設定から使える人を限定することで、参加者の混乱を避けられるかもしれません。</span
                    >
                  </p>
                </v-alert>
              </li>
              <li>
                <p>
                  「キャラクター管理」画面から手駒（サヴァント、レギオン、ホラー）を登録できます。<br />参加者の代わりにドールを登録することもできます。
                </p>
              </li>
              <li><p>ドールは登録後、全ての参加者から見えます。</p></li>
              <li>
                <p class="d-flex flex-row flex-wrap align-center">
                  <span>手駒は登録後に「キャラクター管理」画面上で</span>
                  <v-switch
                    class="d-inline-flex pl-3 pr-2 py-0 bg-grey-lighten-2"
                    color="primary"
                    true-icon="mdi-eye-outline"
                    false-icon="mdi-eye-off-outline"
                    :label="$t('Nechronica.label.view-to-player')"
                    :hide-details="true"
                    density="compact"
                  />
                  <span>を ON にしないと参加者からは見えません。</span>
                </p>
                <p class="d-flex flex-row flex-wrap align-center">
                  <span>これはセッションの途中から舞台に上がる手駒を事前に準備しておくための機能です。</span>
                </p>
              </li>
            </ul>
          </section>

          <section>
            <h3>キャラクターの登録方法</h3>
            <ul>
              <li>
                <p>
                  <a href="https://charasheet.vampire-blood.net/" target="_blank" rel="noopener noreferrer"
                    >キャラクター保管所</a
                  >
                  で作成したネクロニカのキャラクターシートのURLをご用意ください。
                </p>
                <p>
                  例) つぎはぎアリス(<a
                    class="text-caption"
                    href="https://charasheet.vampire-blood.net/m009e8a6f3017dea4154b7d0535d1b61e"
                    target="_blank"
                    rel="noopener noreferrer"
                    >https://charasheet.vampire-blood.net/m009e8a6f3017dea4154b7d0535d1b61e</a
                  >)
                </p>
              </li>
            </ul>
          </section>
        </v-window-item>
      </v-window>
    </v-card-item>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const currentTab = ref('features')
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

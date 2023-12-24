<template>
  <pane-frame :title="$t('Nechronica.label.tips-pane-title')">
    <template #title-action></template>
    <template #layout></template>
    <template #nav></template>
    <template #default>
      <v-sheet class="pa-2 d-flex flex-row flex-wrap align-start" style="gap: 0.5rem">
        <v-card color="cyan-lighten-4">
          <v-card-title>マニューバのアイコンの決まり方</v-card-title>
          <v-card-subtitle>１．基本パーツかどうか</v-card-subtitle>
          <v-card-text>
            マニューバの名前が以下のテキストと一致したら基本パーツのアイコンになります。<br />
            <v-sheet class="d-flex flex-row bg-cyan-lighten-5 my-2" style="gap: 1rem; flex-grow: 1">
              <v-sheet
                class="d-flex flex-row flex-wrap overflow-hidden bg-transparent"
                style="gap: 1rem; width: 1em; flex-grow: 1"
              >
                <ul class="ml-5">
                  <li>のうみそ</li>
                  <li>めだま</li>
                  <li>あご</li>
                </ul>
                <ul class="ml-5">
                  <li>こぶし</li>
                  <li>うで</li>
                  <li>かた</li>
                </ul>
                <ul class="ml-5">
                  <li>せぼね</li>
                  <li>はらわた</li>
                </ul>
                <ul class="ml-5">
                  <li>ほね</li>
                  <li>あし</li>
                </ul>
              </v-sheet>
            </v-sheet>

            ※ マニューバの名前に【】などを含めないように注意してください。
          </v-card-text>
          <v-card-subtitle>２．取得先</v-card-subtitle>
          <v-card-text class="d-flex flex-column align-stretch">
            <span>
              基本パーツではない場合、取得先で判別を行います。<br />
              以下のテキストを<b>含んでいる</b>場合、それに準じたアイコンになります。
            </span>

            <v-sheet class="d-flex flex-row bg-cyan-lighten-5 my-2" style="gap: 1rem; flex-grow: 1">
              <v-sheet
                class="d-flex flex-row flex-wrap overflow-hidden bg-transparent"
                style="gap: 1rem; width: 1em; flex-grow: 1"
              >
                <ul class="ml-5">
                  <li>武装</li>
                  <li>変異</li>
                  <li>改造</li>
                  <li>たからもの</li>
                  <li>タカラモノ</li>
                  <li>ﾀｶﾗﾓﾉ</li>
                  <li>アリス</li>
                  <li>ｱﾘｽ</li>
                </ul>
                <ul class="ml-5">
                  <li>ホリック</li>
                  <li>ﾎﾘｯｸ</li>
                  <li>オートマトン</li>
                  <li>ｵｰﾄﾏﾄﾝ</li>
                  <li>ジャンク</li>
                  <li>ｼﾞｬﾝｸ</li>
                  <li>コート</li>
                  <li>ｺｰﾄ</li>
                </ul>
                <ul class="ml-5">
                  <li>ソロリティ</li>
                  <li>ｿﾛﾘﾃｨ</li>
                  <li>サイケデリック</li>
                  <li>ｻｲｹﾃﾞﾘｯｸ</li>
                  <li>ステーシー</li>
                  <li>ｽﾃｰｼｰ</li>
                  <li>タナトス</li>
                  <li>ﾀﾅﾄｽ</li>
                </ul>
                <ul class="ml-5">
                  <li>ゴシック</li>
                  <li>ｺﾞｼｯｸ</li>
                  <li>レクイエム</li>
                  <li>ﾚｸｲｴﾑ</li>
                  <li>バロック</li>
                  <li>ﾊﾞﾛｯｸ</li>
                  <li>ロマネスク</li>
                  <li>ﾛﾏﾈｽｸ</li>
                </ul>
              </v-sheet>
            </v-sheet>
          </v-card-text>
          <v-card-subtitle>３．それ以外の場合</v-card-subtitle>
          <v-card-text>
            基本パーツでなく取得先でも判断できなかった場合、部位のアイコンとなります。<br />
            部位も設定されていなければ、スキルのアイコン <icon-btn class="skill" size="x-small" /> になります。
          </v-card-text>
          <v-card-subtitle>背景</v-card-subtitle>
          <v-card-text>
            カテゴリに合わせて背景の色が変わります。<br />
            配色はキャラクター保管所の表記と同じです。
          </v-card-text>
        </v-card>
        <v-card color="indigo-lighten-4">
          <v-card-title>最大行動値の自動制御</v-card-title>
          <v-card-subtitle>算出方法</v-card-subtitle>
          <v-card-text>
            「カテゴリ」が「行動値増加」のマニューバの「効果」テキストに含まれる最初の数字を認識します。<br />
            カテゴリを行動値増加にしたマニューバの効果欄のテキストには数字を含めてください。<br />
            テキストに数字が含まれていない場合は 0 として扱います。<br />
            行動値増加のマニューバから判断した数値の合計が最大行動値になります。<br />
            この値は次項で解説する内容によって調整されます。
          </v-card-text>
          <v-card-subtitle>影響を与えるもの</v-card-subtitle>
          <v-card-text>
            以下の内容で最大行動値は自動で調整されます。
            <v-sheet class="bg-indigo-lighten-5 my-2">
              <ul class="pl-5">
                <li>破損したマニューバは最大行動値には含まれなくなります。</li>
                <li>自身の発狂した未練「依存」「不安」ごとに最大行動値が -2 されます。</li>
                <li>他のドールの発狂した未練「信頼」ごとに最大行動値が -1 されます。</li>
              </ul>
            </v-sheet>
          </v-card-text>
          <v-card-subtitle>特殊処理: 【平気】</v-card-subtitle>
          <v-card-text>
            キャラクターシートの読み込み時にマニューバの名前が「平気」「自動制御装置」のいずれかだった場合、<br />
            <v-switch
              label="【平気】として扱う"
              color="primary"
              true-icon="mdi-emoticon-tongue"
              :hide-details="true"
              density="compact"
              class="ml-2"
            />
            が ON として登録されます。<br />
            自作で別名のマニューバを作成していた場合はマニューバの編集にて ON に変更してください。<br />
            「【平気】として扱う」が ON のマニューバがあると、損傷したマニューバに下記のボタンが表示されます。<br />
            <v-sheet class="bg-indigo-lighten-5 pa-2 my-1 d-flex flex-column" style="gap: 0.5rem">
              <v-sheet class="bg-transparent">
                <heiki-btn :ignore-heiki="false" />: このターンに損傷したため平気。最大行動値に含まれる状態。
              </v-sheet>
              <v-sheet class="bg-transparent">
                <heiki-btn :ignore-heiki="true" />:
                以前のターンに損傷していたため平気ではない。最大行動値には含まれない状態。
              </v-sheet>
            </v-sheet>
            「戦闘開始」や「次ターン開始」をすると、全ての損傷したマニューバは平気の対象から外されます。<br />
            平気かどうかはボタンを押すことで手動で切り替えることもできます。<br />
          </v-card-text>
        </v-card>
        <v-card color="green-lighten-4">
          <v-card-title>視点</v-card-title>
          <v-card-subtitle>視点機能とは</v-card-subtitle>
          <v-card-text>
            主催者の画面でのみ利用できる機能です。<br />
            各ツール上で参加者側の視点を確認することができます。
          </v-card-text>
          <v-card-subtitle>主催者と参加者の違い</v-card-subtitle>
          <v-card-text>
            主催者は全ての機能を利用でき、全てのデータを閲覧できます。<br />
            参加者は以下の機能ボタンが表示されません。
            <ul class="pl-5 bg-green-lighten-5 my-2">
              <li>「戦闘開始」</li>
              <li>「カウント減少」</li>
              <li>「次ターン開始」</li>
            </ul>
            またサヴァント・レギオン・ホラーに関しても以下の制限があります。
            <ul class="pl-5 bg-green-lighten-5 my-2">
              <li>キャラクター管理ツールの読込ボタンが表示されない</li>
              <li>「参加者に見せる」が ON でないキャラクターは見えない</li>
              <li>
                キャラクター管理ツール上で編集ができない<br />
                キャラクター閲覧ツール上では見えていれば編集できます
              </li>
            </ul>
          </v-card-text>
          <v-card-subtitle>「参加者に見せる」</v-card-subtitle>
          <v-card-text>
            戦闘前に手駒たちを準備しておくための機能です。<br />
            「戦闘開始」の際に手駒を全て ON にすることができます。
          </v-card-text>
        </v-card>
      </v-sheet>
    </template>
  </pane-frame>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
//noinspection JSUnusedGlobalSymbols
export const componentInfo = {
  name: 'TipsPane',
  label: 'ネクロニカ専用機能のTips'
}
</script>

<script setup lang="ts">
import { Layout } from '@/components/panes'
import HeikiBtn from '@/components/panes/Nechronica/component/HeikiBtn.vue'
import IconBtn from '@/components/panes/Nechronica/maneuver/IconBtn.vue'
import PaneFrame from '@/components/panes/PaneFrame.vue'

defineProps<{
  layout: Layout
  rootLayout: Layout
}>()

defineEmits<{
  (e: 'change-component', componentGroup: string, component: string): void
  (e: 'change-layout', newLayout: Layout): void
}>()
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
:deep(.v-card-title) {
  white-space: pre-wrap;
}
:deep(.v-card-text) {
  line-height: 1.6em;
}
li {
  white-space: pre-wrap;
}
</style>

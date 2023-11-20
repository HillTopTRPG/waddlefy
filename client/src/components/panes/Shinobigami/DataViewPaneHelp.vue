<template>
  <v-card title="ようこそ！" variant="text">
    <v-card-item class="text-caption py-0"> このTipsはセッション情報が追加されると表示されなくなります。 </v-card-item>
    <v-card-item>
      <v-tabs v-model="currentTab">
        <v-defaults-provider :defaults="{ VTab: { variant: 'text', density: 'comfortable' } }">
          <v-tab text="特徴" value="features" />
          <v-tab text="おすすめの準備手順" value="preparation-steps" />
        </v-defaults-provider>
      </v-tabs>
      <v-window v-model="currentTab">
        <v-window-item value="features">
          <ul>
            <li>
              <p>
                ログイン後のURLは再度直接アクセスするとログインを省略してセッションを再開できます。<br />
                （つまりブラウザのページの更新をしても、同じ画面が表示されます）<br />
                異なる端末からアクセスするとログイン画面に戻されます。<br />
                <b>今ブックマークを作っておくと良い</b>です。
              </p>
            </li>
            <li>
              <p>
                端末のスリープ状態から復帰した後などは同期が切れている場合があります。<br />
                ページを更新することで挙動が直ることがあります。
              </p>
            </li>
          </ul>
          <ul>
            <li><p>主催者は全てのデータが閲覧できますが、参加者は閲覧制限があります。</p></li>
            <li><p>キャラクターと紐付けをしていない参加者は秘匿情報が全く見えません。</p></li>
            <li><p>主催者は各画面にて、参加者の視点からの見え方を確認することができます。</p></li>
          </ul>
          <ul>
            <li>
              <p>
                保存データの関連性は
                <b>参加者</b>
                <v-icon size="small" icon="mdi-relation-one-to-one" />
                <b>キャラクター</b>
                <v-icon size="small" icon="mdi-relation-one-to-one" />
                <b>ハンドアウト</b>
                となっています。
              </p>
            </li>
            <li>
              <p>
                <b>参加者</b>
                <v-icon size="small" icon="mdi-relation-one-to-one" />
                <b>キャラクター</b>
                の紐付け設定は
                <view-name-text icon="mdi-view-dashboard" name="キャラクターシート管理画面" />
                で行います。
              </p>
            </li>
            <li>
              <p>
                <b>キャラクター</b>
                <v-icon size="small" icon="mdi-relation-one-to-one" />
                <b>ハンドアウト</b>
                の紐付けは
                <view-name-text icon="mdi-view-dashboard" name="シナリオデータ管理画面" />
                で行います。
              </p>
            </li>
          </ul>
          <ul>
            <li>
              <p>
                <view-name-text icon="mdi-view-dashboard" name="データ閲覧画面" />
                にキャラクター情報を表示するには、ハンドアウトとの紐付けが必要です。
              </p>
            </li>
          </ul>
        </v-window-item>
        <v-window-item value="preparation-steps">
          <ol>
            <li>
              <p>
                <view-name-text icon="mdi-share-variant" name="参加してもらう" class="bg-orange-lighten-3" />
                で事前に参加者アカウントを人数分用意します。<br />
                (主催者であるあなたの分は不要です)
              </p>
            </li>
            <li>
              <p>
                使うキャラクターシートを全て
                <view-name-text icon="mdi-view-dashboard" name="キャラクターシート管理画面" />
                で読み込みます。
              </p>
            </li>
            <li>
              <p>
                参加者が操作するキャラクターには参加者を紐付けます。<br />
                主催者が操作するキャラクターには主催者を紐付けます。<br />
                （主催者を紐づけないと
                <view-name-text icon="mdi-view-dashboard" name="キャラクターシート管理画面" />
                から参加者にキャラクターが見えてしまいます）
              </p>
            </li>
            <li>
              <p>
                <view-name-text icon="mdi-view-dashboard" name="シナリオデータ管理画面" />
                でシナリオのデータを登録します。<br />
                シナリオシートの用意があればそのURLを指定することで、データをまとめて登録できます。
              </p>
            </li>
            <li><p>ハンドアウトを担当するキャラクターを設定します。</p></li>
            <li>
              <p>
                <view-name-text icon="mdi-share-variant" name="参加してもらう" class="bg-orange-lighten-3" />
                で参加者アカウント毎にログインURLをコピーし、各参加者に配布します。<br />
                各参加者はそのURLのページで初期パスワードを設定しセッションに参加することができます。<br />
                参加者毎のログインURLはこのセッション中、ずっと使います。<br />
                セッションに参加できたら、その時点で<b>ブックマーク推奨</b>です。
              </p>
            </li>
          </ol>
        </v-window-item>
      </v-window>
    </v-card-item>
  </v-card>
</template>

<script setup lang="ts">
import ViewNameText from '@/components/panes/Shinobigami/ViewNameText.vue'
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

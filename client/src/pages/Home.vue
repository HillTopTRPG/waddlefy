<template>
  <v-main class="bg-transparent">
    <v-container class="px-0 px-sm-16">
      <div style="position: fixed; right: 0; bottom: 0; z-index: 0">
        <logo-component color="#aaa" height="90vh" class="mr-md-16" />
      </div>
      <div
        class="d-flex d-sm-inline-flex flex-column align-center align-sm-start text-left mx-5 mx-sm-0 position-relative"
      >
        <p class="text-h5 d-block d-sm-none">TRPGセッションに１画面ちょい足し</p>
        <p class="text-h3 text-lg-h2 d-none d-sm-block font-style-top">
          <span class="d-inline-block text-left" style="white-space: nowrap"
            >TRPGセッションに<br />１画面ちょい足し</span
          >
        </p>

        <v-sheet
          class="rounded-xl pa-5 font-style-top mt-5 mt-sm-10"
          style="background-color: rgba(255, 255, 255, 0.6); white-space: nowrap"
        >
          <p>多くのデータ、特殊なルール……<br />大変じゃないですか？<br />楽しさに集中したいそんなあなたに</p>
          <ruby class="text-h5" style="ruby-position: under">Waddlefy<rt>ワドルフィ</rt></ruby>
        </v-sheet>

        <v-card
          elevation="5"
          class="pa-4 mt-5"
          :class="loginFailure ? 'failure' : undefined"
          style="background-color: rgba(255, 255, 255, 0.5)"
        >
          <v-card-item class="ma-0 pa-0">
            <v-text-field
              label="ユーザID*"
              :rules="[x => !!x || '必須項目']"
              variant="solo-filled"
              :autofocus="!Boolean(defaultUserId)"
              @keydown.enter="$event.keyCode === 13 && userId && passwordElm.focus()"
              ref="userIdElm"
              v-model="userId"
            />
            <v-text-field
              label="パスワード"
              type="password"
              hide-details
              class="mb-1"
              variant="solo-filled"
              :autofocus="Boolean(defaultUserId)"
              @keydown.enter="$event.keyCode === 13 && callSignIn()"
              ref="passwordElm"
              v-model="password"
            />
          </v-card-item>
          <v-card-actions class="justify-center">
            <v-btn
              variant="elevated"
              size="large"
              rounded
              color="primary"
              class="px-5"
              text="ログイン"
              :disabled="!userId || !ready"
              :loading="!ready"
              @click="callSignIn()"
            />
            <v-btn variant="flat" rounded href="/sign-up" @click="toSignUp()"
              >または<v-chip variant="text" color="primary">新規登録</v-chip></v-btn
            >
          </v-card-actions>
          <v-card-actions class="justify-center pa-0 font-weight-bold" v-if="loginFailure">
            ログインに失敗しました
          </v-card-actions>
        </v-card>

        <v-sheet
          class="rounded-xl pa-5 font-style-top mt-5 mt-sm-10"
          style="background-color: rgba(255, 255, 255, 0.6); white-space: nowrap"
        >
          <h4>機能一覧</h4>
          <ul>
            <!--
            <li>
              汎用
              <ul>
                <li>
                  方眼紙（四角形）
                  <ul>
                    <li>直線描画</li>
                    <li>マスの塗りつぶし</li>
                    <li>描画した直線やマスとの交点で構成される多角形の塗りつぶし</li>
                  </ul>
                </li>
              </ul>
            </li>
            -->
            <li>
              忍術バトルRPG シノビガミ
              <ul>
                <li>
                  キャラシ登録
                  <ul>
                    <li>キャラクターシート倉庫のURLを使って登録</li>
                  </ul>
                </li>
                <li>
                  キャラクターシート覧表示
                  <ul>
                    <li>公開情報のみを１画面に集約</li>
                    <li>ダメージの簡易入力・記録</li>
                    <li>特技表の判定値計算ツール</li>
                  </ul>
                </li>
                <li>
                  特技表比較
                  <ul>
                    <li>2〜6キャラ分のキャラクターシートの特技表を簡易表示</li>
                    <li>選んだ特技について複数のキャラクターの目標値をまとめて見る</li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </v-sheet>
      </div>
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
import LogoComponent from '@/components/parts/LogoComponent.vue'
import { ref } from 'vue'
import { fetchGraphQlConnectionInfo, makeGraphQlClient, userSignIn } from '@/components/graphql/graphql'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client/core'

import { useRouter } from 'vue-router'
const router = useRouter()

const defaultUserId = localStorage.getItem('userId') || ''
const userId = ref(defaultUserId)
const password = ref('')
const userIdElm = ref()
const passwordElm = ref()

let appSyncClient: ApolloClient<NormalizedCacheObject> | null = null
const ready = ref(false)
const loginFailure = ref(false)

async function init() {
  const { graphql, region } = await fetchGraphQlConnectionInfo()
  appSyncClient = makeGraphQlClient(graphql, region, () => 'waddlefy')
  ready.value = true
}
init().then()

async function callSignIn() {
  loginFailure.value = false
  try {
    await userSignIn(appSyncClient!, userId.value, password.value, router)
  } catch (err) {
    console.error(err)
    console.error('ログインに失敗しました。')
    loginFailure.value = true
    defaultUserId ? passwordElm.value.focus() : userIdElm.value.focus()
  }
}

function toSignUp() {
  router.push({ name: 'SignUp' })
}
</script>

<style>
.font-style-top {
  color: #5c5c5c !important;
}

.failure {
  background-color: rgba(var(--v-theme-warning), 0.5) !important;
}
</style>

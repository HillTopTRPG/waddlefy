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
          class="rounded-xl pa-5 font-style-top mt-5 mt-sm-10 border"
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
              name="user-id"
              autocomplete="on"
              :rules="[x => !!x || '必須項目']"
              variant="solo-filled"
              :autofocus="!Boolean(defaultUserId)"
              @keydown.enter="$event.keyCode === 13 && userId && passwordElm.focus()"
              ref="userIdElm"
              v-model="userId"
            />
            <v-text-field
              label="パスワード"
              name="password"
              type="password"
              autocomplete="password"
              :hide-details="true"
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
            <span class="ml-1 text-body-2">または</span>
            <v-btn text="新規登録" variant="text" color="primary" class="ml-0" href="/sign-up" @click="toSignUp()" />
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
            <li class="ml-6">
              忍術バトルRPG シノビガミ
              <ul>
                <li>
                  キャラクターシート登録
                  <ul>
                    <li>キャラクターシート倉庫のURLを使って登録</li>
                  </ul>
                </li>
                <li>
                  セッションデータ管理
                  <ul>
                    <li>ハンドアウト、エニグマ、ペルソナ、プライズに対応</li>
                    <li>秘匿情報とその公開範囲の入力を強力にサポート</li>
                  </ul>
                </li>
                <li>
                  セッションデータ一覧表示
                  <ul>
                    <li>秘匿情報を参加者それぞれに対して適切に表示</li>
                    <li>ダメージの簡易入力・記録</li>
                    <li>特技表の判定値計算ツール</li>
                    <li>ハンドアウト毎に共有メモと個人メモが書き込める</li>
                  </ul>
                </li>
                <li>
                  特技比較
                  <ul>
                    <li>2〜6キャラ分のキャラクターシートの特技表を簡易表示</li>
                    <li>選んだ特技について複数のキャラクターの目標値を一発で確認</li>
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
import { fetchGraphQlConnectionInfo, makeGraphQlClient, userSignIn } from '@/components/graphql/graphql'
import LogoComponent from '@/components/parts/LogoComponent.vue'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client/core'
import { ref } from 'vue'

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

const graphqlRef = ref('')
const regionRef = ref('')

async function init() {
  const { graphql, region } = await fetchGraphQlConnectionInfo()
  graphqlRef.value = graphql
  regionRef.value = region
  appSyncClient = makeGraphQlClient(graphql, region, () => 'waddlefy')
  ready.value = true
}
init().then()

async function callSignIn() {
  loginFailure.value = false
  try {
    await userSignIn(appSyncClient!, userId.value, password.value, graphqlRef.value, regionRef.value)
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

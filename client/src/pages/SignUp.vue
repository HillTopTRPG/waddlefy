<template>
  <v-main class="bg-transparent">
    <v-container class="px-0 px-sm-16">
      <div class="position-fixed" style="left: 0; bottom: 0; z-index: 0">
        <logo-component color="#aaa" height="90vh" class="ml-md-16" />
      </div>
      <v-row class="pt-0 pt-md-16 align-md-end">
        <v-col cols="12" md="6" class="px-0 d-flex justify-center justify-md-end position-relative">
          <v-sheet
            class="rounded-xl pa-5 font-style-top text-left mx-0 mx-md-16"
            style="background-color: rgba(255, 255, 255, 0.5)"
          >
            <p class="text-h5">
              <ruby style="ruby-position: under">Waddlefy<rt>ワドルフィ</rt></ruby>
              <span>の利用方法</span>
            </p>
            <ol class="ml-4 mt-5" style="line-height: 2em">
              <li>ログイン</li>
              <li>
                セッションを用意する
                <ul class="ml-5" style="line-height: 2em">
                  <li>用途に合わせた画面セットを選ぶ</li>
                  <li>ツールを選んで画面をカスタム</li>
                  <li>画面にデータを入力</li>
                </ul>
              </li>
              <li>共有URLを参加者達に伝える</li>
              <li>参加者は共有URLで合流</li>
              <li>皆で同じデータを見る・操作する</li>
            </ol>
          </v-sheet>
        </v-col>
        <v-col cols="12" md="6" class="px-0 d-flex justify-center justify-md-start position-relative">
          <v-card
            elevation="5"
            class="d-inline-block text-left pa-4"
            :class="signUpFailure ? 'failure' : undefined"
            style="background-color: rgba(255, 255, 255, 0.5)"
          >
            <v-card-item class="ma-0 pa-0">
              <v-text-field
                label="ユーザID*"
                name="user-id"
                autocomplete="on"
                :rules="[x => !!x || '必須項目']"
                variant="solo-filled"
                :autofocus="true"
                v-model="userId"
                :error-messages="userIdCheck ? '' : '重複しています'"
                @keydown.enter="$event.keyCode === 13 && userId && userNameElm.focus()"
                ref="userIdElm"
              />
              <v-text-field
                label="ユーザ名*"
                name="username"
                autocomplete="username"
                :rules="[x => !!x || '必須項目']"
                variant="solo-filled"
                v-model="userName"
                @keydown.enter="$event.keyCode === 13 && userName && passwordElm.focus()"
                ref="userNameElm"
              />
              <v-text-field
                label="パスワード"
                name="password"
                type="password"
                autocomplete="new-password"
                :hide-details="true"
                class="mb-1"
                variant="solo-filled"
                v-model="password"
                @keydown.enter="$event.keyCode === 13 && callSignUp()"
                ref="passwordElm"
              />
            </v-card-item>
            <v-card-actions class="justify-center">
              <v-btn
                variant="elevated"
                size="large"
                rounded
                color="primary"
                class="px-5"
                text="新規登録"
                :disabled="!userId || !userName || !userIdCheck || !ready"
                :loading="!ready"
                @click="callSignUp()"
              />
              <span class="ml-1 text-body-2">または</span>
              <v-btn text="ログイン" variant="text" color="primary" class="ml-0 text-decoration-underline" href="/" />
            </v-card-actions>
            <v-card-actions class="justify-center pa-0 font-weight-bold" v-if="signUpFailure">
              新規登録に失敗しました
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="2" md="2" />
        <v-col cols="8" md="8">
          <v-defaults-provider :defaults="{ VAlert: { ...vAlertDefault, type: 'warning' } }">
            <v-alert
              title="ユーザの自動削除"
              text="30日間使われなかったユーザは毎週火曜日AM6:00に削除されます。"
            />
          </v-defaults-provider>
        </v-col>
        <v-col cols="2" md="2" />
      </v-row>
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
import { fetchGraphQlConnectionInfo, makeGraphQlClient, userSignUp } from '@/components/graphql/graphql'
import { Queries, QueryResult } from '@/components/graphql/schema'
import LogoComponent from '@/components/parts/LogoComponent.vue'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client/core'
import { ref, watch } from 'vue'

const userId = ref('')
const userName = ref('')
const password = ref('')

let appSyncClient: ApolloClient<NormalizedCacheObject> | null = null
const ready = ref(false)
const signUpFailure = ref(false)
const userIdElm = ref()
const userNameElm = ref()
const passwordElm = ref()
const userIdCheck = ref(true)

async function init() {
  const { graphql, region } = await fetchGraphQlConnectionInfo()
  appSyncClient = makeGraphQlClient(graphql, region, () => 'waddlefy')
  ready.value = true
}
init().then()

let timerId: number | undefined = undefined
watch(userId, () => {
  if (timerId !== undefined) {
    window.clearTimeout(timerId)
  }
  timerId = window.setTimeout(async () => {
    if (!appSyncClient) {
      return
    }
    const result = await appSyncClient.mutate<QueryResult.CheckDuplicateUserId>({
      mutation: Queries.checkDuplicateUserId,
      variables: { userId: userId.value }
    })
    console.log(result.data)
    const checkDuplicateUserId = result.data?.checkDuplicateUserId
    if (checkDuplicateUserId) {
      const { ok } = checkDuplicateUserId
      userIdCheck.value = ok
    }
  }, 500)
})

async function callSignUp() {
  signUpFailure.value = false
  try {
    await userSignUp(appSyncClient!, userId.value, userName.value, password.value)
  } catch (err) {
    console.error('新規登録に失敗しました。')
    console.error(err)
    signUpFailure.value = true
    userIdElm.value.focus()
  }
}
const vAlertDefault = {
  border: 'start',
  density: 'compact',
  elevation: '2',
  class: 'mb-3',
  variant: 'tonal'
}
</script>

<!--suppress CssUnusedSymbol, CssUnresolvedCustomProperty -->
<style>
.failure {
  background-color: rgba(var(--v-theme-warning), 0.5) !important;
}

li {
  white-space: nowrap;
}
</style>

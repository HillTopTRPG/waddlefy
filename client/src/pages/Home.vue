<template>
  <top-page-layout>
    <h1 class="text-primary">ログイン</h1>
    <v-card
      elevation="3"
      class="pa-3"
      min-width="18em"
      :class="loginFailure ? 'failure' : undefined"
      style="background-color: rgba(255, 255, 255, 0.5)"
    >
      <v-card-item class="pb-0">
        <v-text-field
          label="ユーザID*"
          name="user-id"
          autocomplete="on"
          hint="必須項目"
          persistent-hint
          class="ma-1"
          :rules="[x => !!x || '必須項目']"
          variant="solo-filled"
          :autofocus="!Boolean(defaultUserId)"
          @keydown.enter="$event.keyCode === 13 && userId && passwordElm.focus()"
          ref="userIdElm"
          v-model="userId"
        />
      </v-card-item>
      <v-card-item class="pb-0">
        <v-text-field
          label="パスワード"
          name="password"
          type="password"
          autocomplete="password"
          class="ma-1"
          variant="solo-filled"
          @keydown.enter="$event.keyCode === 13 && callSignIn()"
          ref="passwordElm"
          v-model="password"
          :autofocus="Boolean(defaultUserId)"
        />
      </v-card-item>
      <v-card-actions>
        <v-btn
          variant="elevated"
          size="large"
          block
          color="primary"
          class="px-5"
          text="ログイン"
          :disabled="!userId || !ready"
          :loading="!ready"
          @click="callSignIn()"
        />
      </v-card-actions>
      <v-card-actions class="justify-center pa-0 font-weight-bold" v-if="loginFailure">
        ログインに失敗しました
      </v-card-actions>
    </v-card>
    <v-sheet class="d-flex flex-column mt-4 bg-transparent">
      <span class="text-caption">初めてのご利用ですか？</span>
      <v-btn text="新規登録" variant="text" color="primary" class="text-h6 text-decoration-underline" href="/sign-up" />
    </v-sheet>
  </top-page-layout>
</template>

<script lang="ts" setup>
import { fetchGraphQlConnectionInfo, makeGraphQlClient, userSignIn } from '@/components/graphql/graphql'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client/core'
import { ref } from 'vue'

import TopPageLayout from '@/pages/TopPageLayout.vue'

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
</script>

<style lang="scss">
.failure {
  background-color: rgba(var(--v-theme-warning), 0.5) !important;
}
</style>

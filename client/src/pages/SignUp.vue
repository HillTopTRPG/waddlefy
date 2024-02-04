<template>
  <top-page-layout>
    <h1 class="text-primary">新規登録</h1>
    <v-card
      elevation="3"
      class="pa-3"
      min-width="18em"
      :class="signUpFailure ? 'failure' : undefined"
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
          :autofocus="true"
          @keydown.enter="$event.keyCode === 13 && userId && userNameElm.focus()"
          ref="userIdElm"
          v-model="userId"
          :error-messages="userIdCheck ? '' : '重複しています'"
        />
      </v-card-item>
      <v-card-item class="pb-0">
        <v-text-field
          label="ユーザ名*"
          name="username"
          autocomplete="username"
          :rules="[x => !!x || '必須項目']"
          variant="solo-filled"
          hint="必須項目"
          class="ma-1"
          persistent-hint
          v-model="userName"
          @keydown.enter="$event.keyCode === 13 && userName && passwordElm.focus()"
          ref="userNameElm"
        />
      </v-card-item>
      <v-card-item class="pb-0">
        <v-text-field
          label="パスワード"
          name="password"
          type="password"
          autocomplete="new-password"
          class="ma-1"
          variant="solo-filled"
          @keydown.enter="$event.keyCode === 13 && callSignUp()"
          ref="passwordElm"
          v-model="password"
        />
      </v-card-item>
      <v-card-actions>
        <v-btn
          variant="elevated"
          size="large"
          block
          color="primary"
          class="px-5"
          text="新規登録"
          :disabled="!userId || !userName || !userIdCheck || !ready"
          :loading="!ready"
          @click="callSignUp()"
        />
      </v-card-actions>
      <v-card-actions class="justify-center pa-0 font-weight-bold" v-if="signUpFailure">
        新規登録に失敗しました
      </v-card-actions>
    </v-card>
    <v-sheet class="d-flex flex-column mt-4 bg-transparent">
      <span class="text-caption">既に登録済みですか？</span>
      <v-btn text="ログイン" variant="text" color="primary" class="text-h6 text-decoration-underline" href="/" />
    </v-sheet>
  </top-page-layout>
</template>

<script lang="ts" setup>
import { fetchGraphQlConnectionInfo, makeGraphQlClient, userSignUp } from '@/components/graphql/graphql'
import { Queries, QueryResult } from '@/components/graphql/schema'
import TopPageLayout from '@/pages/TopPageLayout.vue'
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
    window.logger.info('Queries.checkDuplicateUserId')
    const result = await appSyncClient.mutate<QueryResult.CheckDuplicateUserId>({
      mutation: Queries.checkDuplicateUserId,
      variables: { userId: userId.value }
    })
    window.logger.info(JSON.stringify(result.data, null, 2))
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

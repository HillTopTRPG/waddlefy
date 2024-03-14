<template>
  <top-page-layout>
    <v-list v-if="players.length" class="pa-1 mb-2 rounded-lg">
      <v-list-subheader>他の参加者</v-list-subheader>
      <template v-for="p in players" :key="p.id">
        <v-list-item style="min-height: auto">
          <v-list-item-title>・{{ p.name }}</v-list-item-title>
        </v-list-item>
      </template>
    </v-list>

    <h1 class="text-primary" v-if="player?.name">
      ようこそ <span class="text-h4">{{ player?.name || '' }}</span> さん
    </h1>
    <v-card
      elevation="3"
      class="pa-3"
      min-width="18em"
      :class="signUpFailure ? 'failure' : undefined"
      style="background-color: rgba(255, 255, 255, 0.5)"
    >
      <v-card-item class="pb-0" v-if="!player">
        <v-text-field
          label="なまえ*"
          :rules="[x => !!x || '必須項目']"
          hint="必須項目"
          persistent-hint
          class="ma-1"
          variant="solo-filled"
          v-model="playerName"
          @keydown.enter="$event.keyCode === 13 && playerName && passwordElm.focus()"
          ref="userNameElm"
        />
      </v-card-item>
      <v-card-item class="pb-0">
        <v-text-field
          label="パスワード"
          type="password"
          class="ma-1"
          variant="solo-filled"
          v-model="password"
          @keydown.enter="$event.keyCode === 13 && callSignUp()"
          ref="passwordElm"
        />
      </v-card-item>
      <v-card-actions>
        <v-btn
          variant="elevated"
          size="large"
          block
          color="primary"
          class="px-5"
          text="参加"
          :disabled="!ready || (player ? false : !playerName)"
          :loading="!ready"
          @click="callSignUp()"
        />
      </v-card-actions>
      <v-card-actions class="justify-center pa-0 font-weight-bold" v-if="signUpFailure">
        参加に失敗しました
      </v-card-actions>
    </v-card>
  </top-page-layout>
</template>

<script lang="ts" setup>
import {
  fetchGraphQlConnectionInfo,
  makeGraphQlClient,
  playerFirstSignIn,
  playerSignIn,
  playerSignUp,
  resetPlayerPassword
} from '@/components/graphql/graphql'
import { AbstractPlayer, Queries, QueryResult } from '@/components/graphql/schema'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client/core'
import { ref } from 'vue'

import TopPageLayout from '@/pages/TopPageLayout.vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const props = defineProps<{
  sessionToken?: string
  signUpToken?: string
  playerId?: string
}>()

const playerName = ref('')
const password = ref('')
const resetCode = ref('')

let appSyncClient: ApolloClient<NormalizedCacheObject> | null = null
const ready = ref(false)
const signUpFailure = ref(false)
const passwordElm = ref()

const players = ref<AbstractPlayer[]>([])
const player = ref<AbstractPlayer | null>(null)

const errorMessage = ref('')

function getAuthToken() {
  let result = ''
  if (props.sessionToken) {
    result = `s/${props.sessionToken}`
  }
  if (props.signUpToken) {
    result = `si/${props.signUpToken}`
  }
  return result
}

async function init() {
  const { graphql, region } = await fetchGraphQlConnectionInfo()
  appSyncClient = makeGraphQlClient(graphql, region, getAuthToken)

  if (props.playerId) {
    window.logger.info('Queries.getSessionPlayer')
    const result = await appSyncClient?.mutate<QueryResult.GetSessionPlayer>({
      mutation: Queries.getSessionPlayer,
      variables: { playerId: props.playerId }
    })
    const getSessionPlayer = result?.data?.getSessionPlayer
    if (getSessionPlayer) {
      players.value = []
      player.value = getSessionPlayer
    }
  } else {
    window.logger.info('Queries.getSessionPlayers')
    const result = await appSyncClient?.mutate<QueryResult.GetSessionPlayers>({
      mutation: Queries.getSessionPlayers
    })
    const getSessionPlayers = result?.data?.getSessionPlayers.sort((d: { id: string }, e: { id: string }) => {
      if (d.id < e.id) return -1
      return d.id > e.id ? 1 : 0
    })
    if (getSessionPlayers) {
      players.value = getSessionPlayers
      player.value = null
    }
  }
  ready.value = true
}
init().then()

async function callSignUp() {
  signUpFailure.value = false
  errorMessage.value = ''

  if (!appSyncClient) {
    return
  }

  try {
    const pl = player.value
    if (pl) {
      if (pl.status === 'reset') {
        // resetPlayer
        if (resetCode.value) {
          return resetPlayerPassword(appSyncClient, pl.id, resetCode.value, password.value, router)
        }
        console.warn('resetCode is empty.')
      } else if (pl.status === 'init') {
        return playerFirstSignIn(appSyncClient, pl.id, password.value, router)
      } else {
        // playerSignIn
        return playerSignIn(appSyncClient, pl.id, password.value, router)
      }
    } else {
      const existsPlayer = players.value.find(p => p.name === playerName.value)
      if (!existsPlayer) {
        // sign up
        return playerSignUp(appSyncClient, playerName.value, password.value, router)
      }
      errorMessage.value = '名前が重複しています。'
      signUpFailure.value = true
      return
    }
  } catch (err) {
    // Nothing
    console.error(err)
  }
  errorMessage.value = '失敗しちゃった。'
  signUpFailure.value = true
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

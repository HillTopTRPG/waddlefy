<template>
  <v-main class="bg-transparent">
    <v-container class="px-0 px-sm-16">
      <div class="position-fixed" style="left: 0; bottom: 0; z-index: 0">
        <logo-component color="#aaa" height="90vh" class="ml-md-16" />
      </div>
      <v-row class="pt-0 pt-md-16 align-md-end">
        <v-col cols="12" md="6" class="px-0 d-flex justify-center justify-md-end position-relative">
          <v-list>
            <v-list-subheader v-if="players.length">他の参加者</v-list-subheader>
            <template v-for="p in players" :key="p.id">
              <v-list-item>
                <v-list-item-title>{{ p.name }}</v-list-item-title>
              </v-list-item>
            </template>
          </v-list>
        </v-col>
        <v-col cols="12" md="6" class="px-0 d-flex justify-center justify-md-start position-relative">
          <v-card
            elevation="5"
            class="d-inline-block text-left pa-4"
            :class="signUpFailure ? 'failure' : undefined"
            style="background-color: rgba(255, 255, 255, 0.5)"
          >
            <v-card-title v-if="player"
              >ようこそ <span class="text-h4">{{ player?.name }}</span> さん</v-card-title
            >
            <v-card-text class="ma-0 pa-0">
              <v-text-field
                v-if="!player"
                label="なまえ*"
                :rules="[x => !!x || '必須項目']"
                variant="solo-filled"
                v-model="playerName"
                @keydown.enter="$event.keyCode === 13 && playerName && passwordElm.focus()"
                ref="userNameElm"
              />
              <v-text-field
                label="パスワード"
                type="password"
                :hide-details="true"
                class="mb-1"
                variant="solo-filled"
                v-model="password"
                @keydown.enter="$event.keyCode === 13 && callSignUp()"
                ref="passwordElm"
              />
            </v-card-text>
            <v-card-actions class="justify-center">
              <v-btn
                variant="elevated"
                size="large"
                rounded
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
        </v-col>
      </v-row>
    </v-container>
  </v-main>
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
import LogoComponent from '@/components/parts/LogoComponent.vue'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client/core'
import { ref } from 'vue'

import { useRouter } from 'vue-router'
const router = useRouter()

const props = defineProps<{
  sessionToken?: string
  signUpToken?: string
  playerId?: string
}>()

console.log(
  JSON.stringify(
    {
      sessionToken: props.sessionToken,
      signUpToken: props.signUpToken,
      playerId: props.playerId
    },
    null,
    2
  )
)

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
  console.log(result)
  return result
}

async function init() {
  const { graphql, region } = await fetchGraphQlConnectionInfo()
  appSyncClient = makeGraphQlClient(graphql, region, getAuthToken)

  if (props.playerId) {
    console.log('Queries.getSessionPlayer')
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
    console.log('Queries.getSessionPlayers')
    const result = await appSyncClient?.mutate<QueryResult.GetSessionPlayers>({
      mutation: Queries.getSessionPlayers
    })
    const getSessionPlayers = result?.data?.getSessionPlayers
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

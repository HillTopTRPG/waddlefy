<template>
  <v-card class="d-flex flex-row" variant="outlined" rounded="lg" :height="(textRows + 2) * 24 + 22">
    <v-tabs
      color="primary"
      direction="vertical"
      prev-icon="mdi-chevron-up"
      next-icon="mdi-chevron-down"
      :center-active="false"
      v-model="tab"
    >
      <v-defaults-provider
        :defaults="{
          VTab: { size: 'small', variant: 'text', flat: true, density: 'comfortable' }
        }"
      >
        <v-tab text="共有メモ" value="session-memo" prepend-icon="mdi-antenna" />
        <v-tab text="個人メモ" value="private-memo" prepend-icon="mdi-account-outline" />
        <v-tab text="人物欄" value="correlations" prepend-icon="mdi-account-heart-outline" />

        <!-- ハンドアウト -->
        <template v-if="handout">
          <v-tab text="使命" value="objective" prepend-icon="mdi-bullseye" />
          <v-tab
            text="秘密"
            value="secret"
            :disabled="!secretOpen"
            :prepend-icon="secretOpen ? 'mdi-lock-open-outline' : 'mdi-lock-outline'"
          />
        </template>

        <!-- エニグマ -->
        <template v-for="(enigma, idx) in boundEnigmaList" :key="enigma.id">
          <v-tab
            :text="`エニグマ${idx + 1}`"
            :value="enigma.id"
            :prepend-icon="enigma.data.disabled ? 'mdi-bomb-off' : 'mdi-bomb'"
          />
        </template>

        <!-- ペルソナ -->
        <template v-for="(persona, idx) in boundPersonaList" :key="persona.id">
          <v-tab
            :text="`ペルソナ${idx + 1}`"
            :value="persona.id"
            :prepend-icon="persona.data.leaked ? 'mdi-email-open-outline' : 'mdi-email-outline'"
          />
        </template>
      </v-defaults-provider>
    </v-tabs>
    <v-divider :vertical="true" />
    <v-window v-model="tab">
      <v-window-item value="session-memo">
        <menu-edit-text-area
          label="共有メモ"
          hint="全員で閲覧・編集できます"
          :text="sessionMemo?.text || ''"
          icon="mdi-antenna"
          variant="solo-filled"
          :editable="true"
          textareaClass="ma-2"
          :text-rows="textRows"
          :offset="-textRows * 24"
          @update="updateSessionMemo"
        />
      </v-window-item>
      <v-window-item value="private-memo">
        <menu-edit-text-area
          label="個人メモ"
          hint="あなた専用のメモです"
          :text="privateMemo?.text || ''"
          icon="mdi-account-outline"
          variant="solo-filled"
          :editable="true"
          textareaClass="ma-2"
          :text-rows="textRows"
          :offset="-textRows * 24"
          @update="updatePrivateMemo"
        />
      </v-window-item>
      <v-window-item value="correlations">
        {{ '' /* TODO 人物欄 */ }}
      </v-window-item>
      <v-window-item value="objective">
        <menu-edit-text-area
          label="使命"
          hint="編集不可"
          :text="handout?.data.objective"
          icon="mdi-bullseye"
          variant="solo-filled"
          :editable="false"
          textareaClass="ma-2"
          :text-rows="textRows"
        />
      </v-window-item>
      <v-window-item value="secret">
        <menu-edit-text-area
          label="秘密"
          hint="編集不可"
          :text="secretText"
          :icon="secretOpen ? 'mdi-lock-open-outline' : 'mdi-lock-outline'"
          variant="solo-filled"
          :editable="false"
          textareaClass="ma-2"
          :text-rows="textRows"
        />
      </v-window-item>
      <v-window-item v-for="(enigma, idx) in boundEnigmaList" :key="enigma.id" :value="enigma.id">
        <menu-edit-text-area
          :label="`エニグマ${idx + 1}`"
          hint="編集不可"
          :text="`${enigma.data.disabled ? '【解除済】\n' : ''}${enigma.data.effect}`"
          :icon="enigma.data.disabled ? 'mdi-bomb-off' : 'mdi-bomb'"
          variant="solo-filled"
          :editable="false"
          textareaClass="ma-2"
          :text-rows="textRows"
        />
      </v-window-item>
      <v-window-item v-for="(persona, idx) in boundPersonaList" :key="persona.id" :value="persona.id">
        <menu-edit-text-area
          :label="`ペルソナ${idx + 1}`"
          hint="編集不可"
          :text="persona.data.leaked ? `真実名 : ${persona.data.name}\n効果 : \n${persona.data.effect}` : '未公開'"
          :icon="persona.data.leaked ? 'mdi-email-open-outline' : 'mdi-email-outline'"
          variant="solo-filled"
          :editable="false"
          textareaClass="ma-2"
          :text-rows="textRows"
        />
      </v-window-item>
    </v-window>
  </v-card>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import MenuEditTextArea from '@/components/parts/MenuEditTextArea.vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const props = defineProps<{
  characterId: string
  textRows: number
}>()

const tab = ref('session-memo')

const isOwnerControl = computed(() => Boolean(graphQlStore?.state.user?.token))
const privateMemo = computed(
  () =>
    graphQlStore?.state.sessionDataList.find(sd => {
      if (sd.type !== 'shinobigami-character-private-memo') return false
      if (sd.data.characterId !== props.characterId) return false
      if (isOwnerControl.value) {
        if (sd.data.ownerType !== 'user') return false
      } else {
        if (sd.data.ownerType !== 'player') return false
        if (sd.data.ownerId !== graphQlStore?.state.player?.id) return false
      }
      return true
    })?.data
)
const sessionMemo = computed(
  () =>
    graphQlStore?.state.sessionDataList.find(sd => {
      if (sd.type !== 'shinobigami-character-session-memo') return false
      return sd.data.characterId === props.characterId
    })?.data
)

async function updateSessionMemo(text: string) {
  if (sessionMemo.value) {
    await graphQlStore?.updateShinobigamiCharacterSessionMemo(sessionMemo.value.id, props.characterId, text)
  } else {
    await graphQlStore?.addShinobigamiCharacterSessionMemo(props.characterId, text)
  }
}

async function updatePrivateMemo(text: string) {
  if (privateMemo.value) {
    await graphQlStore?.updateShinobigamiCharacterPrivateMemo(privateMemo.value.id, props.characterId, text)
  } else {
    await graphQlStore?.addShinobigamiCharacterPrivateMemo(props.characterId, text)
  }
}

const handout = computed(() => {
  return graphQlStore?.state.sessionDataList.find(
    sd => sd.type === 'shinobigami-handout' && sd.data.person === props.characterId
  )
})

const boundEnigmaList = computed(() => {
  const handout = graphQlStore?.state.sessionDataList.find(
    sd => sd.type === 'shinobigami-handout' && sd.data.person === props.characterId
  )
  if (!handout) return null

  return graphQlStore?.state.sessionDataList.filter(
    enigma => enigma.type === 'shinobigami-enigma' && enigma.data.bind === handout.id
  )
})

const boundPersonaList = computed(() => {
  const handout = graphQlStore?.state.sessionDataList.find(
    sd => sd.type === 'shinobigami-handout' && sd.data.person === props.characterId
  )
  if (!handout) return null

  return graphQlStore?.state.sessionDataList.filter(
    enigma => enigma.type === 'shinobigami-persona' && enigma.data.bind === handout.id
  )
})

const secretOpen = computed((): boolean => {
  if (isOwnerControl.value) return true

  // キャラクターのオーナーの場合
  if (handout.value.data.knowSelfSecret) {
    const handoutCharacter = graphQlStore?.state.sessionDataList.find(sd => sd.id === handout.value.data.person)
    if (graphQlStore?.state.player?.id === handoutCharacter?.data.player) return true
  }

  const secretRelations = graphQlStore?.state.sessionDataList.filter(
    sd =>
      sd.type === 'shinobigami-handout-relation' && sd.data.type === 'secret' && sd.data.targetId === handout.value?.id
  )

  return (
    secretRelations.some(sd => {
      const targetHandout = graphQlStore?.state.sessionDataList.find(sdc => sdc.id === sd.data.ownerId)
      const character = graphQlStore?.state.sessionDataList.find(sdc => sdc.id === targetHandout?.data.person)
      return character && graphQlStore?.state.player?.id === character.data.player
    }) || false
  )
})

const secretText = computed((): string => {
  if (isOwnerControl.value) return handout.value?.data.secret || ''
  if (!handout.value) return ''

  return secretOpen.value ? handout.value?.data.secret : '閲覧不可'
})
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>

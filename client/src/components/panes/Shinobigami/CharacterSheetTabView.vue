<template>
  <v-card class="d-flex flex-row" variant="tonal">
    <v-tabs v-model="tab" direction="vertical" color="primary">
      <v-defaults-provider
        :defaults="{
          VTab: { size: 'small', variant: 'text', density: 'comfortable' }
        }"
      >
        <v-tab value="session-memo" prepend-icon="mdi-antenna">共有メモ</v-tab>
        <v-tab value="private-memo" prepend-icon="mdi-account-outline">個人メモ</v-tab>

        <v-tab value="objective" prepend-icon="mdi-account-outline">使命</v-tab>
        <v-tab
          value="secret"
          :disabled="!secretOpen"
          :prepend-icon="secretOpen ? 'mdi-lock-open-outline' : 'mdi-lock-outline'"
          >秘密</v-tab
        >
        <v-tab v-for="(enigma, idx) in boundEnigmaList" :key="enigma.id" :value="enigma.id" prepend-icon="mdi-bomb"
          >エニグマ{{ idx + 1 }}</v-tab
        >
        <v-tab v-for="(persona, idx) in boundPersonaList" :key="persona.id" :value="persona.id" :prepend-icon="persona.data.leaked ? 'mdi-email-open-outline' : 'mdi-email-outline'"
          >ペルソナ{{ idx + 1 }}</v-tab
        >
      </v-defaults-provider>
    </v-tabs>
    <v-window v-model="tab">
      <v-window-item value="session-memo">
        <character-sheet-tab-text-area
          label="共有メモ"
          icon="mdi-antenna"
          :editable="true"
          :text-rows="textRows"
          :character-name="characterInfo?.character.characterName"
          :text="sessionMemo?.text || ''"
          hint="全員で閲覧・編集できます"
          @update="v => updateSessionMemo(v)"
        />
      </v-window-item>
      <v-window-item value="private-memo">
        <character-sheet-tab-text-area
          label="個人メモ"
          icon="mdi-account-outline"
          :editable="true"
          :text-rows="textRows"
          :character-name="characterInfo?.character.characterName"
          :text="privateMemo?.text || ''"
          hint="あなた専用のメモです"
          @update="v => updatePrivateMemo(v)"
        />
      </v-window-item>
      <v-window-item value="objective">
        <character-sheet-tab-text-area
          label="使命"
          icon="mdi-lock-open-outline"
          :editable="false"
          :text-rows="textRows"
          :character-name="characterInfo?.character.characterName"
          :text="handout?.data.objective"
        />
      </v-window-item>
      <v-window-item value="secret">
        <character-sheet-tab-text-area
          label="秘密"
          :icon="secretOpen ? 'mdi-lock-open-outline' : 'mdi-lock-outline'"
          :editable="false"
          :text-rows="textRows"
          :character-name="characterInfo?.character.characterName"
          :text="secretText"
        />
      </v-window-item>
      <v-window-item v-for="(enigma, idx) in boundEnigmaList" :key="enigma.id" :value="enigma.id">
        <character-sheet-tab-text-area
          :label="`エニグマ${idx + 1}`"
          icon="mdi-bomb"
          :editable="false"
          :text-rows="textRows"
          :character-name="characterInfo?.character.characterName"
          :text="enigma.data.effect"
        />
      </v-window-item>
      <v-window-item v-for="(persona, idx) in boundPersonaList" :key="persona.id" :value="persona.id">
        <character-sheet-tab-text-area
          :label="`ペルソナ${idx + 1}`"
          :icon="persona.data.leaked ? 'mdi-email-open-outline' : 'mdi-email-outline'"
          :editable="false"
          :text-rows="textRows"
          :character-name="characterInfo?.character.characterName"
          :text="persona.data.leaked ? `真実名 : ${persona.data.name}\n効果 : \n${persona.data.effect}` : '未公開'"
        />
      </v-window-item>
    </v-window>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ComputedRef, inject, ref } from 'vue'

import { CharacterWrap, GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import CharacterSheetTabTextArea from '@/components/panes/Shinobigami/CharacterSheetTabTextArea.vue'
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
      if (sd.type !== 'character-private-memo') return false
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
      if (sd.type !== 'character-session-memo') return false
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

const characterInfo: ComputedRef<CharacterWrap> = computed(
  () => graphQlStore?.state.sessionDataList.find(sd => sd.id === props.characterId)?.data
)

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

  return handout.value?.data.leakedList.some(l => {
    const leakedHandout = graphQlStore?.state.sessionDataList.find(sd => sd.id === l)
    if (!leakedHandout?.data.person) return false
    const leakedCharacter = graphQlStore?.state.sessionDataList.find(sd => sd.id === leakedHandout?.data.person)
    return leakedCharacter?.data.player === graphQlStore?.state.player?.id
  })
})

const secretText = computed((): string => {
  if (isOwnerControl.value) return handout.value?.data.secret || ''
  if (!handout.value) return ''

  return secretOpen.value ? handout.value?.data.secret : '閲覧不可'
})
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>

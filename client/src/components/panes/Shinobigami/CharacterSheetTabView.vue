<template>
  <v-card class="d-flex flex-row" variant="tonal">
    <v-tabs v-model="tab" direction="vertical" color="primary">
      <v-tab value="session-memo" size="small" variant="text" density="comfortable" prepend-icon="mdi-antenna">
        共有メモ
      </v-tab>
      <v-tab value="private-memo" size="small" variant="text" density="comfortable" prepend-icon="mdi-account">
        個人メモ
      </v-tab>
      <v-tab value="secret" variant="text" size="small" density="comfortable" prepend-icon="mdi-lock">秘密</v-tab>
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
          icon="mdi-account"
          :editable="true"
          :text-rows="textRows"
          :character-name="characterInfo?.character.characterName"
          :text="privateMemo?.text || ''"
          hint="あなた専用のメモです"
          @update="v => updatePrivateMemo(v)"
        />
      </v-window-item>
      <v-window-item value="secret">
        <character-sheet-tab-text-area
          label="秘密"
          icon="mdi-lock"
          :editable="false"
          :text-rows="textRows"
          :character-name="characterInfo?.character.characterName"
          :text="
            `${characterInfo?.character.characterName}の秘密\n` +
            'The Woodman set to work at once, and so sharp was his axe that the tree was soon chopped nearly through.\n' +
            'The Woodman set to work at once, and so sharp was his axe that the tree was soon chopped nearly through.\n' +
            'The Woodman set to work at once, and so sharp was his axe that the tree was soon chopped nearly through.\n' +
            'The Woodman set to work at once, and so sharp was his axe that the tree was soon chopped nearly through.\n' +
            'The Woodman set to work at once, and so sharp was his axe that the tree was soon chopped nearly through.'
          "
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
  () =>
    graphQlStore?.state.sessionDataList.find(
      sd => sd.type === 'character' && sd.data?.character && sd.id === props.characterId
    )?.data
)
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>

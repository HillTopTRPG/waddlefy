<template>
  <v-card class="d-flex flex-row" variant="tonal">
    <v-tabs v-model="tab" direction="vertical" color="primary">
      <v-tab value="room-memo" size="small" variant="text" density="comfortable" prepend-icon="mdi-antenna">
        共有メモ
      </v-tab>
      <v-tab value="private-memo" size="small" variant="text" density="comfortable" prepend-icon="mdi-account">
        個人メモ
      </v-tab>
      <v-tab value="secret" variant="text" size="small" density="comfortable" prepend-icon="mdi-lock">秘密</v-tab>
    </v-tabs>
    <v-window v-model="tab">
      <v-window-item value="room-memo">
        <character-sheet-tab-text-area
          label="共有メモ"
          icon="mdi-antenna"
          :editable="true"
          :text-rows="textRows"
          :character-name="characterInfo?.character.characterName"
          :text="
            `${characterInfo?.character.characterName}の共有メモ\n` +
            'The Woodman set to work at once, and so sharp was his axe that the tree was soon chopped nearly through.\n' +
            'The Woodman set to work at once, and so sharp was his axe that the tree was soon chopped nearly through.\n' +
            'The Woodman set to work at once, and so sharp was his axe that the tree was soon chopped nearly through.\n' +
            'The Woodman set to work at once, and so sharp was his axe that the tree was soon chopped nearly through.\n' +
            'The Woodman set to work at once, and so sharp was his axe that the tree was soon chopped nearly through.'
          "
          @update="v => emits('update-room-memo', v)"
        />
      </v-window-item>
      <v-window-item value="private-memo">
        <character-sheet-tab-text-area
          label="個人メモ"
          icon="mdi-account"
          :editable="true"
          :text-rows="textRows"
          :character-name="characterInfo?.character.characterName"
          :text="
            `${characterInfo?.character.characterName}の個人メモ\n` +
            'The Woodman set to work at once, and so sharp was his axe that the tree was soon chopped nearly through.\n' +
            'The Woodman set to work at once, and so sharp was his axe that the tree was soon chopped nearly through.\n' +
            'The Woodman set to work at once, and so sharp was his axe that the tree was soon chopped nearly through.\n' +
            'The Woodman set to work at once, and so sharp was his axe that the tree was soon chopped nearly through.\n' +
            'The Woodman set to work at once, and so sharp was his axe that the tree was soon chopped nearly through.'
          "
          @update="v => emits('update-private-memo', v)"
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

const emits = defineEmits<{
  (e: 'update-room-memo', text: string): void
  (e: 'update-private-memo', text: string): void
}>()

const tab = ref('room-memo')

const characterInfo: ComputedRef<CharacterWrap> = computed(
  () =>
    graphQlStore?.state.sessionDataList.find(
      sd => sd.type === 'character' && sd.data?.character && sd.id === props.characterId
    )?.data
)
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>

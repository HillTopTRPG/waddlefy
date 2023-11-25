<template>
  <template v-if="character">
    <v-menu :close-on-content-click="false" scroll-strategy="close" location="top left">
      <template #activator="{ props }">
        <v-sheet class="d-flex flex-row text-left align-center">
          <v-sheet
            v-ripple
            v-bind="props"
            rounded="lg"
            class="ellipsis text-h5 text-decoration-underline overflow-y-hidden"
            style="width: 1em; flex-grow: 1"
          >
            {{ character.data.character.basic.characterName }}
          </v-sheet>
          <v-btn
            icon="mdi-open-in-new"
            variant="flat"
            size="small"
            target="_blank"
            rel="noopener noreferrer"
            :href="character.data.character.url"
          />
        </v-sheet>
      </template>
      <v-card>
        <v-card-text class="d-flex flex-row align-end">
          <icon-btn
            :disable-button="true"
            :under-text="positionList[character.data.character.basic.position]?.text || ''"
            :class="positionList[character.data.character.basic.position].val || ''"
          />
          <span style="font-size: 11px; line-height: 1.2em">/</span>
          <icon-btn
            :disable-button="true"
            :under-text="classList[character.data.character.basic.mainClass]?.text || ''"
            class="small"
            :class="classList[character.data.character.basic.mainClass].val || ''"
          />
          <template v-if="character.data.character.basic.mainClass !== character.data.character.basic.subClass">
            <span style="font-size: 11px; line-height: 1.2em">/</span>
            <icon-btn
              :disable-button="true"
              :under-text="classList[character.data.character.basic.subClass]?.text || ''"
              class="small"
              :class="classList[character.data.character.basic.subClass].val || ''"
            />
          </template>
          <template v-else>
            <span style="font-size: 11px; line-height: 1.2em">×2</span>
          </template>
        </v-card-text>
        <v-card-text>
          {{ character.data.character.basic.characterName }}
        </v-card-text>
        <v-card-actions>
          <delete-menu-btn
            :target-name="character.data.character.basic.characterName"
            :session-id="graphQlStore?.state.session?.id || ''"
            type="キャラクター"
            @execute="() => graphQlStore?.deleteSessionData(characterId)"
          />
          <reload-character-sheet-btn :character-id="characterId" />
        </v-card-actions>
      </v-card>
    </v-menu>
  </template>
</template>

<script setup lang="ts">
import IconBtn from '@/components/panes/Nechronica/IconBtn.vue'
import { Nechronica } from '@/components/panes/Nechronica/nechronica'
import { computed, inject } from 'vue'

import DeleteMenuBtn from '@/components/DeleteMenuBtn.vue'
import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import ReloadCharacterSheetBtn from '@/components/panes/Nechronica/ReloadCharacterSheetBtn.vue'

const graphQlStore = inject<GraphQlStore>(GraphQlKey)

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  characterId: string
}>()

const character = computed((): { id: string; data: { player: string; character: Nechronica } } | undefined => {
  return graphQlStore?.state.sessionDataList.find(sd => sd.id === props.characterId)
})

const positionList = [
  { val: '', text: '' },
  { val: 'alice', text: 'アリス' },
  { val: 'holic', text: 'ホリック' },
  { val: 'automaton', text: 'オートマトン' },
  { val: 'junk', text: 'ジャンク' },
  { val: 'coat', text: 'コート' },
  { val: 'sorority', text: 'ソロリティ' }
]
const classList = [
  { val: '', text: '' },
  { val: 'stacy', text: 'ステーシー' },
  { val: 'thanatos', text: 'タナトス' },
  { val: 'gothic', text: 'ゴシック' },
  { val: 'requiem', text: 'レクイエム' },
  { val: 'baroque', text: 'バロック' },
  { val: 'romanesque', text: 'ロマネスク' },
  { val: 'psychedelic', text: 'サイケデリック' }
]
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>

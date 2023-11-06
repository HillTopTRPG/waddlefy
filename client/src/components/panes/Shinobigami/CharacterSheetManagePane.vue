<template>
  <pane-frame title="キャラクターシート管理">
    <template v-slot:title-action> </template>
    <template v-slot:layout> </template>
    <template v-slot:default>
      <v-sheet class="w-100 d-flex flex-wrap">
        <v-text-field
          label="キャラクターシート倉庫のURL"
          color="primary"
          class="name-text-field overflow-visible mx-3 my-2"
          :hide-details="true"
          variant="outlined"
          :error-messages="addUrlErrorMessage"
          v-model="addUrl"
          @keydown.enter="$event.keyCode === 13 && addUrl && callAddCharacter()"
          @click:append-inner.stop
        >
          <template v-slot:append-inner>
            <v-divider :vertical="true" />
            <v-btn
              :disabled="Boolean(addUrlErrorMessage) || !addUrl"
              text="読込"
              variant="text"
              class="bg-transparent h-100"
              @click.prevent.stop="callAddCharacter()"
              @mousedown.prevent.stop
              @mouseup.prevent.stop
            />
          </template>
        </v-text-field>
      </v-sheet>
      <v-sheet class="w-100 d-flex flex-wrap">
        <v-card class="ma-3 w-100" variant="outlined" v-for="cw in characterWraps" :key="cw.id">
          <v-card-title>
            <span>{{ cw.character.characterName }}</span>
            <change-player-dialog
              :character-name="cw.character.characterName"
              :player="cw.player"
              @submit="v => updateCharacterPlayer(cw.id, v)"
            />
          </v-card-title>
          <v-card-item class="pt-0">
            <v-card variant="tonal">
              <template v-slot:title>
                <v-icon icon="mdi-lock" />
                秘密
              </template>
              <v-sheet class="flex-row d-flex pt-2">
                <character-sheet-tab-text-area
                  label="秘密の内容"
                  icon=""
                  :editable="true"
                  :text-rows="10"
                  :character-name="cw.character.characterName"
                  :text="
                    graphQlStore?.state.sessionDataList.find(
                      sd => sd.type === 'character-secret' && sd.data.characterId === cw.id
                    )?.data.text || ''
                  "
                  hint=""
                  @update="v => updateSecretText(cw.id, v)"
                  variant="outlined"
                  class="mx-4 flex-grow-0"
                />
                <v-list density="compact" class="pa-0">
                  <v-list-subheader>この秘密を閲覧できるキャラクター</v-list-subheader>
                  <v-list-item v-for="cwc in characterWraps" :key="cwc.id">
                    <v-checkbox-btn
                      :model-value="
                        graphQlStore?.state.sessionDataList
                          .find(sd => sd.type === 'character-secret' && sd.data.characterId === cw.id)
                          ?.data.shareCharacterIdList.some(id => id === cwc.id)
                      "
                      @change="v => updateSecretShare(cw.id, cwc.id, v.target.checked)"
                      :label="`${cwc.character.characterName}(${
                        graphQlStore?.state.players.find(p => p.id === cwc.player)?.name || 'PL割当なし'
                      })`"
                    />
                  </v-list-item>
                </v-list>
              </v-sheet>
            </v-card>
          </v-card-item>
        </v-card>
      </v-sheet>
    </template>
  </pane-frame>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
//noinspection JSUnusedGlobalSymbols
export const componentInfo = {
  name: 'CharacterSheetManagePane',
  label: 'キャラクターシート管理'
}
</script>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { Layout } from '@/components/panes'
import PaneFrame from '@/components/panes/PaneFrame.vue'
import { ShinobigamiHelper } from '@/components/panes/Shinobigami/shinobigami'

import { CharacterWrap, GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import ChangePlayerDialog from '@/components/panes/Shinobigami/ChangePlayerDialog.vue'
import CharacterSheetTabTextArea from '@/components/panes/Shinobigami/CharacterSheetTabTextArea.vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const characterWraps = computed<CharacterWrap[]>(() => {
  if (!graphQlStore) return []
  return graphQlStore.state.sessionDataList
    .filter(sd => sd.type === 'character' && sd.data?.character)
    .map(sd => sd.data as CharacterWrap)
})

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  layout: Layout
  rootLayout: Layout
}>()

// eslint-disable-next-line unused-imports/no-unused-vars
const emits = defineEmits<{
  (e: 'change-component', componentGroup: string, component: string): void
  (e: 'change-layout', newLayout: Layout): void
}>()

const addUrl = ref('')
const addUrlErrorMessage = ref('')
async function callAddCharacter() {
  const helper = new ShinobigamiHelper(addUrl.value, '')
  if (helper.isThis()) {
    const { data } = await helper.getData()
    await graphQlStore?.addShinobigamiCharacter(data)
  }
}

async function updateCharacterPlayer(characterId: string, playerId: string) {
  console.log(characterId, playerId)
  await graphQlStore?.updateShinobigamiCharacter(
    characterId,
    playerId,
    characterWraps.value.find(cw => cw.id === characterId)?.character
  )
}

async function updateSecretText(characterId: string, text: string) {
  if (!graphQlStore) return
  const owner = graphQlStore.state.sessionDataList.find(
    sd => sd.type === 'character-secret' && sd.data.characterId === characterId
  )
  if (owner) {
    owner.data.text = text
    await graphQlStore?.updateShinobigamiCharacterSecret(owner.id, characterId, text, owner.data.shareCharacterIdList)
  } else {
    await graphQlStore?.addShinobigamiCharacterSecret(characterId, text, [])
  }
}

async function updateSecretShare(characterId: string, targetId: string, share: boolean) {
  if (!graphQlStore) return
  console.log(characterId, targetId, share)
  const owner = graphQlStore.state.sessionDataList.find(
    sd => sd.type === 'character-secret' && sd.data.characterId === characterId
  )
  if (owner) {
    const idx = owner.data.shareCharacterIdList.findIndex(sci => sci === targetId)
    if (idx < 0 && share) {
      owner.data.shareCharacterIdList.push(targetId)
      await graphQlStore?.updateShinobigamiCharacterSecret(
        owner.id,
        characterId,
        owner.data.text,
        owner.data.shareCharacterIdList
      )
    } else if (idx >= 0 && !share) {
      owner.data.shareCharacterIdList.splice(idx, 1)
      await graphQlStore?.updateShinobigamiCharacterSecret(
        owner.id,
        characterId,
        owner.data.text,
        owner.data.shareCharacterIdList
      )
    }
  } else {
    const shareCharacterIdList = []
    if (share) {
      shareCharacterIdList.push(targetId)
    }
    await graphQlStore?.addShinobigamiCharacterSecret(characterId, '', shareCharacterIdList)
  }
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>

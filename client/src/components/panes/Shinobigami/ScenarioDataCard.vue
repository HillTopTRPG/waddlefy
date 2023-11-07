<template>
  <v-card
    v-if="dataObj"
    :color="typeList.find(t => t.value === dataObj.type)?.color || ''"
    class="ml-3 mb-3 border elevation-4"
    rounded="lg"
  >
    <v-card-title class="ma-2" color="red">{{
      typeList.find(t => t.value === dataObj.type)?.label || ''
    }}</v-card-title>
    <v-card-item class="pa-0">
      <v-sheet class="d-flex flex-column align-self-start px-2 pb-2 bg-transparent" style="gap: 0.5rem">
        <template v-if="dataObj.type === 'shinobigami-handout'">
          <dialog-edit-text-field
            :title="`${dataObj.data.name || 'ななし'}の名前編集`"
            label="名前"
            :width="20"
            :text="dataObj.data.name"
            :editable="true"
            @update="onUpdateShinobigamiHandoutName"
          />
          <dialog-edit-text-area
            :title="`${dataObj.data.name || 'ななし'}の使命の編集`"
            label="使命"
            :editable="true"
            icon=""
            variant=""
            :text-rows="5"
            :text="dataObj.data.objective"
            @update="onUpdateShinobigamiHandoutObjective"
          />
          <dialog-edit-text-area
            :title="`${dataObj.data.name || 'ななし'}の秘密の編集`"
            label="秘密"
            :editable="true"
            icon=""
            variant=""
            :text-rows="5"
            :text="dataObj.data.secret"
            @update="onUpdateShinobigamiHandoutSecret"
          />
          <v-select
            :items="hasEmptyCharacterList"
            item-value="id"
            item-title="name"
            variant="solo"
            :flat="true"
            label="担当キャラ"
            class="align-self-start"
            hide-details
            style="width: 20rem; max-width: 20rem"
            persistent-placeholder
            :model-value="dataObj.data.person"
            @update:model-value="v => onUpdateShinobigamiHandoutPerson(v)"
          />
          <v-card variant="text" class="bg-white pa-3">
            <v-card-subtitle class="text-body-2">このキャラの秘密を知るハンドアウト</v-card-subtitle>
            <v-sheet class="d-flex flex-column bg-transparent">
              <handout-multi-checkbox :list="dataObj.data.leakedList" @update="onUpdateShinobigamiHandoutLeakedList" />
            </v-sheet>
          </v-card>
        </template>
        <template v-if="dataObj.type === 'shinobigami-enigma'">
          <dialog-edit-text-field
            :title="`${dataObj.data.name || 'ななし'}の名前編集`"
            label="名前"
            :width="20"
            :text="dataObj.data.name"
            :editable="true"
            @update="onUpdateShinobigamiEnigmaName"
          />
          <dialog-edit-text-area
            :title="`${dataObj.data.name || 'ななし'}の偽装の編集`"
            label="偽装"
            :editable="true"
            icon=""
            variant=""
            :text-rows="5"
            :text="dataObj.data.camouflage"
            @update="onUpdateShinobigamiEnigmaCamouflage"
          />
          <dialog-edit-text-field
            :title="`${dataObj.data.name || 'ななし'}の戦力の名称の編集`"
            label="戦力の名称"
            :width="20"
            :text="dataObj.data.entityName"
            :editable="true"
            @update="onUpdateShinobigamiEnigmaEntityName"
          />
          <v-sheet class="d-flex flex-row flex-wrap bg-transparent" style="gap: 0.5rem">
            <v-select
              :items="[1, 2, 3, 4, 5]"
              label="脅威度"
              variant="solo"
              :flat="true"
              class="align-self-start"
              :hide-details="true"
              :persistent-placeholder="true"
              style="min-width: 5.5em; max-width: 5.5em; gap: 0"
              :model-value="dataObj.data.threat"
              @update:model-value="v => onUpdateShinobigamiEnigmaThreat(v)"
            />
            <dialog-edit-text-field
              :title="`${dataObj.data.name || 'ななし'}の解除条件の編集`"
              label="解除条件"
              :width="14"
              :editable="true"
              :text="dataObj.data.disableJudgement"
              @update="onUpdateShinobigamiEnigmaDisableJudgement"
            />
          </v-sheet>
          <dialog-edit-text-area
            :title="`${dataObj.data.name || 'ななし'}の効果の編集`"
            label="効果"
            :editable="true"
            icon=""
            variant=""
            :text-rows="5"
            :text="dataObj.data.effect"
            @update="onUpdateShinobigamiEnigmaEffect"
          />
          <v-select
            :items="hasEmptyHandoutList"
            item-value="id"
            item-title="name"
            variant="solo"
            :flat="true"
            label="バインド"
            class="align-self-start"
            hide-details
            style="width: 20rem; max-width: 20rem"
            persistent-placeholder
            :model-value="dataObj.data.bind"
            @update:model-value="v => onUpdateShinobigamiEnigmaBind(v)"
          />
          <v-checkbox-btn
            label="戦力の公開"
            :model-value="dataObj.data.used"
            @update:model-value="v => onUpdateShinobigamiEnigmaUsed(v)"
          />
          <v-checkbox-btn
            label="解除"
            :model-value="dataObj.data.disabled"
            @update:model-value="v => onUpdateShinobigamiEnigmaDisabled(v)"
          />
        </template>
        <template v-if="dataObj.type === 'shinobigami-persona'">
          <dialog-edit-text-field
            :title="`${dataObj.data.name || 'ななし'}の真実名の編集`"
            label="真実名"
            :width="20"
            :text="dataObj.data.name"
            :editable="true"
            @update="onUpdateShinobigamiPersonaName"
          />
          <dialog-edit-text-area
            :title="`${dataObj.data.name || 'ななし'}の効果の編集`"
            label="効果"
            :editable="true"
            icon=""
            variant=""
            :text-rows="5"
            :text="dataObj.data.effect"
            @update="onUpdateShinobigamiPersonaEffect"
          />
          <v-select
            :items="hasEmptyHandoutList"
            item-value="id"
            item-title="name"
            variant="solo"
            :flat="true"
            label="所有されるハンドアウト"
            class="align-self-start"
            hide-details
            style="width: 20rem; max-width: 20rem"
            persistent-placeholder
            :model-value="dataObj.data.bind"
            @update:model-value="v => onUpdateShinobigamiPersonaBind(v)"
          />
          <v-checkbox-btn
            label="真実の公開"
            :model-value="dataObj.data.leaked"
            @update:model-value="v => onUpdateShinobigamiPersonaLeaked(v)"
          />
        </template>
        <template v-if="dataObj.type === 'shinobigami-prize'">
          <dialog-edit-text-field
            :title="`${dataObj.data.name || 'ななし'}の名前編集`"
            label="名前"
            :width="20"
            :editable="true"
            :text="dataObj.data.name"
            @update="onUpdateShinobigamiPrizeName"
          />
          <dialog-edit-text-area
            :title="`${dataObj.data.name || 'ななし'}の説明の編集`"
            label="説明"
            :editable="true"
            icon=""
            variant=""
            :text-rows="5"
            :text="dataObj.data.description"
            @update="onUpdateShinobigamiPrizeDescription"
          />
          <dialog-edit-text-area
            :title="`${dataObj.data.name || 'ななし'}の秘密の編集`"
            label="秘密"
            :editable="true"
            icon=""
            variant=""
            :text-rows="5"
            :text="dataObj.data.secret"
            @update="onUpdateShinobigamiPrizeSecret"
          />
          <v-select
            :items="hasEmptyHandoutList"
            item-value="id"
            item-title="name"
            variant="solo"
            :flat="true"
            label="所有者"
            class="align-self-start"
            persistent-hint
            hint="所有者はこのプライズの名前と説明を常に読めます"
            style="width: 20rem; max-width: 20rem"
            persistent-placeholder
            :model-value="dataObj.data.owner"
            @update:model-value="v => onUpdateShinobigamiPrizeOwner(v)"
          />
          <v-card variant="text" class="bg-white pa-3">
            <v-card-subtitle class="text-body-2">このプライズの存在を知るハンドアウト</v-card-subtitle>
            <v-sheet class="d-flex flex-column bg-transparent">
              <handout-multi-checkbox
                :list="dataObj.data.readableList"
                @update="onUpdateShinobigamiPrizeReadableList"
              />
            </v-sheet>
          </v-card>
          <v-card variant="text" class="bg-white pa-3">
            <v-card-subtitle class="text-body-2">このプライズの秘密を知るハンドアウト</v-card-subtitle>
            <v-sheet class="d-flex flex-column bg-transparent">
              <handout-multi-checkbox :list="dataObj.data.leakedList" @update="onUpdateShinobigamiPrizeLeakedList" />
            </v-sheet>
          </v-card>
        </template>
      </v-sheet>
      <v-card-actions>
        <v-spacer />
        <v-btn color="red" variant="text">削除</v-btn>
      </v-card-actions>
    </v-card-item>
  </v-card>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import DialogEditTextField from '@/components/panes/Shinobigami/DialogEditTextField.vue'
import DialogEditTextArea from '@/components/panes/Shinobigami/DialogEditTextArea.vue'
import HandoutMultiCheckbox from '@/components/panes/Shinobigami/HandoutMultiCheckbox.vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  dataId: string
}>()

const dataObj = computed(() => {
  return graphQlStore?.state.sessionDataList.find(sd => sd.id === props.dataId)
})

const typeList = [
  { value: 'shinobigami-handout', label: 'ハンドアウト', color: 'teal-lighten-4' },
  { value: 'shinobigami-enigma', label: 'エニグマ', color: 'indigo-lighten-4' },
  { value: 'shinobigami-persona', label: 'ペルソナ', color: 'cyan-lighten-4' },
  { value: 'shinobigami-prize', label: 'プライズ', color: 'amber-lighten-4' }
]

const hasEmptyHandoutList = computed(() => {
  const handoutList = graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'shinobigami-handout') || []
  const resultList = handoutList.map(h => {
    const characterInfo = graphQlStore?.state.sessionDataList.find(sd => sd.id === h.data.person)
    const nameList = [h.data.name]
    if (characterInfo) {
      const characterName = characterInfo.data.character.characterName
      if (characterName) {
        nameList.push(` (${characterName}`)
      }
      if (characterInfo.data.player) {
        const player = graphQlStore?.state.players.find(p => p.id === characterInfo.data.player)
        if (player) {
          nameList.push(` : ${player.name})`)
        }
      }
      if (nameList.length < 3) {
        nameList.push(')')
      }
    }
    return {
      id: h.id,
      name: nameList.join('')
    }
  })
  resultList.unshift({ id: '', name: '割当なし' })
  return resultList
})

const hasEmptyCharacterList = computed(() => {
  const characterList = graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'character') || []
  const resultList = characterList.map(c => {
    const nameList = [c.data.character.characterName]
    if (c.data.player) {
      const player = graphQlStore?.state.players.find(p => p.id === c.data.player)
      if (player) {
        nameList.push(`(${player.name})`)
      }
    }
    return {
      id: c.id,
      name: nameList.join('')
    }
  })
  resultList.unshift({ id: '', name: '割当なし' })
  return resultList
})

async function onUpdateShinobigamiHandoutName(name: string) {
  await graphQlStore?.updateShinobigamiHandout(
    dataObj.value.id,
    name,
    dataObj.value.data.objective,
    dataObj.value.data.secret,
    dataObj.value.data.person,
    dataObj.value.data.leakedList
  )
}

async function onUpdateShinobigamiHandoutObjective(objective: string) {
  await graphQlStore?.updateShinobigamiHandout(
    dataObj.value.id,
    dataObj.value.data.name,
    objective,
    dataObj.value.data.secret,
    dataObj.value.data.person,
    dataObj.value.data.leakedList
  )
}

async function onUpdateShinobigamiHandoutSecret(secret: string) {
  await graphQlStore?.updateShinobigamiHandout(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.objective,
    secret,
    dataObj.value.data.person,
    dataObj.value.data.leakedList
  )
}

async function onUpdateShinobigamiHandoutPerson(person: string) {
  await graphQlStore?.updateShinobigamiHandout(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.objective,
    dataObj.value.data.secret,
    person,
    dataObj.value.data.leakedList
  )
}

async function onUpdateShinobigamiHandoutLeakedList(leakedList: string[]) {
  await graphQlStore?.updateShinobigamiHandout(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.objective,
    dataObj.value.data.secret,
    dataObj.value.data.person,
    leakedList
  )
}

async function onUpdateShinobigamiEnigmaName(name: string) {
  await graphQlStore?.updateShinobigamiEnigma(
    dataObj.value.id,
    name,
    dataObj.value.data.threat,
    dataObj.value.data.disableJudgement,
    dataObj.value.data.camouflage,
    dataObj.value.data.entityName,
    dataObj.value.data.effect,
    dataObj.value.data.bind,
    dataObj.value.data.used,
    dataObj.value.data.disabled
  )
}

async function onUpdateShinobigamiEnigmaThreat(threat: string) {
  await graphQlStore?.updateShinobigamiEnigma(
    dataObj.value.id,
    dataObj.value.data.name,
    threat,
    dataObj.value.data.disableJudgement,
    dataObj.value.data.camouflage,
    dataObj.value.data.entityName,
    dataObj.value.data.effect,
    dataObj.value.data.bind,
    dataObj.value.data.used,
    dataObj.value.data.disabled
  )
}

async function onUpdateShinobigamiEnigmaDisableJudgement(disableJudgement: string) {
  await graphQlStore?.updateShinobigamiEnigma(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.threat,
    disableJudgement,
    dataObj.value.data.camouflage,
    dataObj.value.data.entityName,
    dataObj.value.data.effect,
    dataObj.value.data.bind,
    dataObj.value.data.used,
    dataObj.value.data.disabled
  )
}

async function onUpdateShinobigamiEnigmaCamouflage(camouflage: string) {
  await graphQlStore?.updateShinobigamiEnigma(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.threat,
    dataObj.value.data.disableJudgement,
    camouflage,
    dataObj.value.data.entityName,
    dataObj.value.data.effect,
    dataObj.value.data.bind,
    dataObj.value.data.used,
    dataObj.value.data.disabled
  )
}

async function onUpdateShinobigamiEnigmaEntityName(entityName: string) {
  await graphQlStore?.updateShinobigamiEnigma(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.threat,
    dataObj.value.data.disableJudgement,
    dataObj.value.data.camouflage,
    entityName,
    dataObj.value.data.effect,
    dataObj.value.data.bind,
    dataObj.value.data.used,
    dataObj.value.data.disabled
  )
}

async function onUpdateShinobigamiEnigmaEffect(effect: string) {
  await graphQlStore?.updateShinobigamiEnigma(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.threat,
    dataObj.value.data.disableJudgement,
    dataObj.value.data.camouflage,
    dataObj.value.data.entityName,
    effect,
    dataObj.value.data.bind,
    dataObj.value.data.used,
    dataObj.value.data.disabled
  )
}

async function onUpdateShinobigamiEnigmaBind(bind: string) {
  await graphQlStore?.updateShinobigamiEnigma(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.threat,
    dataObj.value.data.disableJudgement,
    dataObj.value.data.camouflage,
    dataObj.value.data.entityName,
    dataObj.value.data.effect,
    bind,
    dataObj.value.data.used,
    dataObj.value.data.disabled
  )
}

async function onUpdateShinobigamiEnigmaUsed(used: boolean) {
  await graphQlStore?.updateShinobigamiEnigma(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.threat,
    dataObj.value.data.disableJudgement,
    dataObj.value.data.camouflage,
    dataObj.value.data.entityName,
    dataObj.value.data.effect,
    dataObj.value.data.bind,
    used,
    dataObj.value.data.disabled
  )
}

async function onUpdateShinobigamiEnigmaDisabled(disabled: boolean) {
  await graphQlStore?.updateShinobigamiEnigma(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.threat,
    dataObj.value.data.disableJudgement,
    dataObj.value.data.camouflage,
    dataObj.value.data.entityName,
    dataObj.value.data.effect,
    dataObj.value.data.bind,
    dataObj.value.data.used,
    disabled
  )
}

async function onUpdateShinobigamiPersonaName(name: string) {
  await graphQlStore?.updateShinobigamiPersona(
    dataObj.value.id,
    name,
    dataObj.value.data.effect,
    dataObj.value.data.bind,
    dataObj.value.data.leaked
  )
}

async function onUpdateShinobigamiPersonaEffect(effect: string) {
  await graphQlStore?.updateShinobigamiPersona(
    dataObj.value.id,
    dataObj.value.data.name,
    effect,
    dataObj.value.data.bind,
    dataObj.value.data.leaked
  )
}

async function onUpdateShinobigamiPersonaBind(bind: string) {
  await graphQlStore?.updateShinobigamiPersona(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.effect,
    bind,
    dataObj.value.data.leaked
  )
}

async function onUpdateShinobigamiPersonaLeaked(leaked: boolean) {
  await graphQlStore?.updateShinobigamiPersona(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.effect,
    dataObj.value.data.bind,
    leaked
  )
}

async function onUpdateShinobigamiPrizeName(name: string) {
  await graphQlStore?.updateShinobigamiPrize(
    dataObj.value.id,
    name,
    dataObj.value.data.description,
    dataObj.value.data.secret,
    dataObj.value.data.owner,
    dataObj.value.data.readableList,
    dataObj.value.data.leakedList
  )
}

async function onUpdateShinobigamiPrizeDescription(description: string) {
  await graphQlStore?.updateShinobigamiPrize(
    dataObj.value.id,
    dataObj.value.data.name,
    description,
    dataObj.value.data.secret,
    dataObj.value.data.owner,
    dataObj.value.data.readableList,
    dataObj.value.data.leakedList
  )
}

async function onUpdateShinobigamiPrizeSecret(secret: string) {
  await graphQlStore?.updateShinobigamiPrize(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.description,
    secret,
    dataObj.value.data.owner,
    dataObj.value.data.readableList,
    dataObj.value.data.leakedList
  )
}

async function onUpdateShinobigamiPrizeOwner(owner: string) {
  await graphQlStore?.updateShinobigamiPrize(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.description,
    dataObj.value.data.secret,
    owner,
    dataObj.value.data.readableList,
    dataObj.value.data.leakedList
  )
}

async function onUpdateShinobigamiPrizeReadableList(readableList: string[]) {
  await graphQlStore?.updateShinobigamiPrize(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.description,
    dataObj.value.data.secret,
    dataObj.value.data.owner,
    readableList,
    dataObj.value.data.leakedList
  )
}

async function onUpdateShinobigamiPrizeLeakedList(leakedList: boolean) {
  await graphQlStore?.updateShinobigamiPrize(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.description,
    dataObj.value.data.secret,
    dataObj.value.data.owner,
    dataObj.value.data.readableList,
    leakedList
  )
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>

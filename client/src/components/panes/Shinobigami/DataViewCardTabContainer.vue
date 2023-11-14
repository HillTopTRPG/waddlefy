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

        <!-- ハンドアウト -->
        <template v-if="handout">
          <v-tab text="使命" value="objective" prepend-icon="mdi-bullseye" />
          <v-tab
            text="秘密"
            value="secret"
            :disabled="!secretOpen"
            :prepend-icon="secretOpen ? 'mdi-lock-open-outline' : 'mdi-lock-outline'"
          />
          <v-tab
            text="人物欄"
            :disabled="!otherHandouts.length"
            value="correlations"
            prepend-icon="mdi-account-heart-outline"
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
          :text="sessionMemo?.data.text || ''"
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
          :text="privateMemo?.data.text || ''"
          icon="mdi-account-outline"
          variant="solo-filled"
          :editable="true"
          textareaClass="ma-2"
          :text-rows="textRows"
          :offset="-textRows * 24"
          @update="updatePrivateMemo"
        />
      </v-window-item>
      <v-window-item value="correlations" class="pa-2" :style="`height: ${(textRows + 2) * 24 + 20}px`" v-if="handout">
        <v-sheet
          class="d-flex flex-column overflow-y-auto mb-2"
          style="gap: 0.3rem"
          :style="`height: ${textRows * 24 + 23}px`"
        >
          <template v-for="otherHandout in otherHandouts" :key="otherHandout.id">
            <correlations-card
              mode="view"
              :owner-id="handout.id"
              :target-id="otherHandout.id"
              :perspective="perspective"
            />
          </template>
          <template v-if="!otherHandouts.length"> 独り </template>
        </v-sheet>
        <v-divider />
        <div class="text-caption py-1 pl-4" style="opacity: 0.5">編集不可</div>
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
          :auto-grow="true"
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
          :auto-grow="true"
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
          :auto-grow="true"
          :text-rows="textRows"
        />
      </v-window-item>
      <v-window-item v-for="(persona, idx) in boundPersonaList" :key="persona.id" :value="persona.id">
        <menu-edit-text-area
          :label="`ペルソナ${idx + 1}`"
          hint="編集不可"
          :text="
            !perspective || persona.data.leaked
              ? `真実名 : ${persona.data.name}\n効果 : \n${persona.data.effect}`
              : '未公開'
          "
          :icon="persona.data.leaked ? 'mdi-email-open-outline' : 'mdi-email-outline'"
          variant="solo-filled"
          :editable="false"
          textareaClass="ma-2"
          :auto-grow="true"
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
import CorrelationsCard from '@/components/panes/Shinobigami/CorrelationsCard.vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const props = defineProps<{
  handoutId: string
  textRows: number
  perspective: string
}>()

const otherHandouts = computed(() => {
  return graphQlStore?.state.sessionDataList.filter(sd => {
    if (sd.type !== 'shinobigami-handout') return false
    if (sd.id === handout.value.id) return false
    return !props.perspective || sd.data.published
  })
})

const tab = ref('session-memo')

const isUserControl = computed(() => Boolean(graphQlStore?.state.user?.token))
const privateMemo = computed(
  () =>
    graphQlStore?.state.sessionDataList.find(sd => {
      if (sd.type !== 'shinobigami-handout-private-memo') return false
      if (sd.data.handoutId !== props.handoutId) return false
      if (isUserControl.value) {
        if (sd.data.ownerType === 'user') return true
      } else {
        if (sd.data.ownerType === 'player' && sd.data.ownerId !== graphQlStore?.state.player?.id) return true
      }
      return false
    })
)
const sessionMemo = computed(
  () =>
    graphQlStore?.state.sessionDataList.find(sd => {
      if (sd.type !== 'shinobigami-handout-session-memo') return false
      return sd.data.handoutId === props.handoutId
    })
)

async function updateSessionMemo(text: string) {
  if (sessionMemo.value) {
    await graphQlStore?.updateShinobigamiHandoutSessionMemo(sessionMemo.value.id, props.handoutId, text)
  } else {
    await graphQlStore?.addShinobigamiHandoutSessionMemo(props.handoutId, text)
  }
}

async function updatePrivateMemo(text: string) {
  if (privateMemo.value) {
    await graphQlStore?.updateShinobigamiHandoutPrivateMemo(privateMemo.value.id, props.handoutId, text)
  } else {
    await graphQlStore?.addShinobigamiHandoutPrivateMemo(props.handoutId, text)
  }
}

const handout = computed(() => {
  return graphQlStore?.state.sessionDataList.find(sd => sd.type === 'shinobigami-handout' && sd.id === props.handoutId)
})

const boundEnigmaList = computed(() => {
  return graphQlStore?.state.sessionDataList.filter(
    enigma => enigma.type === 'shinobigami-enigma' && enigma.data.bind === props.handoutId
  )
})

const boundPersonaList = computed(() => {
  return graphQlStore?.state.sessionDataList.filter(
    persona => persona.type === 'shinobigami-persona' && persona.data.bind === props.handoutId
  )
})

const secretOpen = computed((): boolean => {
  if (!props.perspective) return true

  // キャラクターのオーナーの場合
  if (handout.value.data.knowSelfSecret) {
    const handoutCharacter = graphQlStore?.state.sessionDataList.find(sd => sd.id === handout.value.data.person)
    if (props.perspective === handoutCharacter?.data.player) return true
  }

  const secretRelations = graphQlStore?.state.sessionDataList.filter(
    sd =>
      sd.type === 'shinobigami-handout-relation' && sd.data.type === 'secret' && sd.data.targetId === handout.value?.id
  )

  return (
    secretRelations.some(sd => {
      const targetHandout = graphQlStore?.state.sessionDataList.find(sdc => sdc.id === sd.data.ownerId)
      const character = graphQlStore?.state.sessionDataList.find(sdc => sdc.id === targetHandout?.data.person)
      return props.perspective === character?.data.player
    }) || false
  )
})

const secretText = computed((): string => {
  if (!props.perspective) return handout.value?.data.secret || ''
  if (!handout.value) return ''

  return secretOpen.value ? handout.value?.data.secret : '閲覧不可'
})
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>

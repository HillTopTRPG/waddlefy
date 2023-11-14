<template>
  <v-card variant="flat" class="overflow-x-auto">
    <v-card-title class="pt-0 pl-0 pb-0 d-flex align-center flex-row">
      <template v-if="characterSheet">
        <span class="ml-4 text-h5">{{ characterHandout.data.name }}</span>
        <v-menu :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <v-btn variant="text" v-bind="props" class="text-h5 px-1 text-decoration-underline">
              {{ characterSheet.characterName }}
            </v-btn>
          </template>
          <v-container class="base-info px-2 pt-2 pb-1">
            <v-defaults-provider :defaults="{ VChip: { class: 'px-3 mr-1', size: 'small', variant: 'outlined' } }">
              <v-defaults-provider :defaults="{ VCol: { class: 'py-0' }, VRow: { class: 'py-0 my-0' } }">
                <v-row class="mb-1">
                  <v-col>
                    <v-chip :text="characterSheet.level" v-if="characterSheet.level" style="border-color: #666" />
                    <v-chip :text="characterSheet.age" v-if="characterSheet.age" style="border-color: #666" />
                    <v-chip :text="characterSheet.sex" v-if="characterSheet.sex" style="border-color: #666" />
                    <v-chip :text="characterSheet.cover" v-if="characterSheet.cover" style="border-color: #666" />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-chip size="large" style="border-color: #666">
                      {{ characterSheet.upperStyle
                      }}{{ characterSheet.subStyle ? ` - ${characterSheet.subStyle}` : '' }}
                    </v-chip>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <div class="tree">
                      <ul>
                        <li v-if="characterSheet.stylerule">{{ characterSheet.stylerule }}</li>
                        <li v-if="characterSheet.foe">仇敵：{{ characterSheet.foe }}</li>
                      </ul>
                    </div>
                  </v-col>
                </v-row>
              </v-defaults-provider>
            </v-defaults-provider>
          </v-container>
        </v-menu>
        <v-defaults-provider :defaults="{ VBtn: { size: 'small', variant: 'flat' } }">
          <v-btn icon="mdi-open-in-new" target="_blank" rel="noopener noreferrer" :href="characterSheet.url" />
        </v-defaults-provider>
        <span class="text-body-2">({{ player?.id === perspective ? 'あなた' : player?.name || 'PL割当なし' }})</span>
      </template>
      <template v-else>
        <span class="ml-4 text-h5">{{ scenarioData.data.name }}</span>
      </template>
    </v-card-title>
    <v-card-title class="pt-0 d-flex flex-wrap" style="gap: 5px">
      <template v-if="backgroundView && characterSheet">
        <template v-for="(back, idx) in characterSheet.backgroundList" :key="idx">
          <background-chip :text="back.name" :chip="back.effect" :type="back.type" :point="back.point" />
        </template>
      </template>
      <template v-for="prize in prizeList" :key="prize.id">
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-defaults-provider :defaults="{ VChip: { label: true, border: true, elevation: 3 } }">
              <v-chip variant="flat" size="small" color="lime-lighten-2" v-bind="props">
                <v-icon icon="mdi-treasure-chest-outline" class="mr-1" />
                <span>{{ prize.data.name }}</span>
              </v-chip>
            </v-defaults-provider>
          </template>
          <v-card class="pb-3">
            <v-defaults-provider :defaults="{ VTextarea: { noResize: true, hideDetails: true } }">
              <v-defaults-provider :defaults="{ VTextarea: { readonly: true, autoGrow: true, rows: 1 } }">
                <v-card-item class="py-0">
                  <v-textarea :model-value="prize.data.description" variant="outlined" class="mt-3" label="説明" />
                </v-card-item>
                <v-card-item class="py-0" v-if="isPrizeSecret(prize.data.leakedList)">
                  <v-textarea :model-value="prize.data.secret" variant="outlined" class="mt-3" label="秘密" />
                </v-card-item>
              </v-defaults-provider>
            </v-defaults-provider>
          </v-card>
        </v-menu>
      </template>
    </v-card-title>
    <v-card-text class="py-0">
      <v-sheet class="w-100 d-flex flex-wrap" style="gap: 5px">
        <v-sheet v-if="tokugiView && characterSheet">
          <speciality-table
            class="mb-2"
            :select-skill="selectSkill"
            @update:select-skill="v => emits('update:select-skill', v)"
            v-model:editing="tokugiTableEditing"
            :info="computedSkills"
            :perspective="perspective"
            @update:info="v => updateInfo(v)"
            :editable="true"
          />
        </v-sheet>
        <v-sheet v-if="ninpouView && characterSheet">
          <ninpou-table
            class="mb-2"
            :list="characterSheet.ninjaArtsList"
            :perspective="perspective"
            @click-skill="v => emits('update:select-skill', v === selectSkill ? '' : v)"
          />
        </v-sheet>
        <v-sheet v-if="textView && handoutId">
          <data-view-card-tab-container
            class="mb-2"
            :handout-id="handoutId"
            :perspective="perspective"
            :text-rows="textRows"
          />
        </v-sheet>
      </v-sheet>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import { Layout } from '@/components/panes'
import SpecialityTable from '@/components/panes/Shinobigami/SpecialityTable.vue'
import NinpouTable from '@/components/panes/Shinobigami/NinpouTable.vue'
import BackgroundChip from '@/components/panes/Shinobigami/BackgroundChip.vue'
import { ShinobiGami } from '@/components/panes/Shinobigami/shinobigami'
import { SaikoroFictionTokugi } from '@/components/panes/Shinobigami/SaikoroFiction'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import { clone } from '@/components/panes/Shinobigami/PrimaryDataUtility'
import DataViewCardTabContainer from '@/components/panes/Shinobigami/DataViewCardTabContainer.vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const props = defineProps<{
  characterId?: string
  scenarioDataId?: string
  selectSkill: string
  backgroundView: boolean
  ninpouView: boolean
  tokugiView: boolean
  textView: boolean
  textRows: number
  perspective: string
}>()

const scenarioData = computed(() => {
  return graphQlStore?.state.sessionDataList.find(sd => sd.id === props.scenarioDataId)
})

const character = computed(() => {
  if (props.characterId) {
    return graphQlStore?.state.sessionDataList.find(sd => sd.id === props.characterId)
  } else if (props.scenarioDataId && scenarioData.value?.type === 'shinobigami-handout') {
    return graphQlStore?.state.sessionDataList.find(sd => sd.id === scenarioData.value?.data.person)
  }
  return undefined
})

const prizeList = computed(() => {
  function judgeWrap(ownerId: string) {
    return (
      graphQlStore?.state.sessionDataList.filter(sd => {
        if (sd.type !== 'shinobigami-prize') return false
        if (sd.data.owner !== ownerId) return false
        if (!props.perspective) return true
        return sd.data.readableList.some(r => {
          const readableHandout = graphQlStore?.state.sessionDataList.find(sdc => sdc.id === r)
          if (!readableHandout) return false
          const readableCharacter = graphQlStore?.state.sessionDataList.find(
            sdc => sdc.id === readableHandout?.data.person
          )
          return readableCharacter.data.player === props.perspective
        })
      }) || []
    )
  }
  if (props.characterId) {
    return judgeWrap(characterHandout.value?.id)
  } else if (props.scenarioDataId && scenarioData.value?.type === 'shinobigami-handout') {
    return judgeWrap(props.scenarioDataId)
  }
  return []
})

function isPrizeSecret(prizeLeakedList: string[]) {
  return prizeLeakedList.some(l => {
    const leakedHandout = graphQlStore?.state.sessionDataList.find(sd => sd.id === l)
    if (!leakedHandout) return false
    const leakedCharacter = graphQlStore?.state.sessionDataList.find(sd => sd.id === leakedHandout.data.person)
    if (!leakedCharacter) return false
    return leakedCharacter.data.player === props.perspective
  })
}

const characterSheet = computed(() => character.value?.data.character as ShinobiGami | undefined)
const computedSkills = computed(() => clone(characterSheet.value?.skill))

const characterHandout = computed(
  () =>
    graphQlStore?.state.sessionDataList.find(
      sd => sd.type === 'shinobigami-handout' && sd.data?.person === props.characterId
    )
)

const handoutId = computed(() => {
  return scenarioData.value?.type === 'shinobigami-handout' ? props.scenarioDataId : characterHandout.value?.id
})

const player = computed(() => graphQlStore?.state.players.find(p => p.id === character.value.data.player))

const emits = defineEmits<{
  (e: 'change-component', componentGroup: string, component: string): void
  (e: 'change-layout', newLayout: Layout): void
  (e: 'update:select-skill', selectSkill: string): void
}>()

const navigationDrawer = ref(false)
watch(navigationDrawer, v => {
  if (v) {
    emits('select-skill', '')
  }
})

const tokugiTableEditing = ref(false)

async function updateInfo(info: SaikoroFictionTokugi) {
  if (!graphQlStore) return
  const characterSheetClone = clone(characterSheet.value)!
  characterSheetClone.skill = info
  await graphQlStore.updateShinobigamiCharacter(
    props.characterId,
    player.value.id,
    character.value.data.viewPass,
    characterSheetClone
  )
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.abs-menu {
  right: 0;
}
.ninja-style-ex-panel:deep(button) {
  padding: 0;
}

.tree {
  /*親要素*/
  position: relative;
  font-size: 0.85rem;
  line-height: 1.5;
  margin-left: 1em;
}

.tree ul {
  padding-left: 5px;
  list-style: none;
}
.tree ul li {
  position: relative;
  padding-top: 5px;
  padding-bottom: 5px;
  padding-left: 15px;
  box-sizing: border-box;
}
.tree ul li:before {
  position: absolute;
  top: 15px;
  left: 0;
  width: 10px;
  height: 1px;
  margin: auto;
  content: '';
  background-color: #666;
}
.tree ul li:after {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 1px;
  height: 100%;
  content: '';
  background-color: #666;
}
.tree ul li:last-child:after {
  height: 15px;
}

.base-info {
  background-image: url('/paint_00001.jpg');
}
</style>

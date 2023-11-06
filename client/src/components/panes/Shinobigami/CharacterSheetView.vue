<template>
  <v-sheet class="w-100 d-flex flex-wrap">
    <v-sheet class="mr-3 mb-3">
      <v-container class="pr-0">
        <v-defaults-provider :defaults="{ VCol: { class: 'pa-0' } }">
          <v-row>
            <v-col>
              <v-menu :close-on-content-click="false">
                <template v-slot:activator="{ props }">
                  <v-btn variant="text" v-bind="props" class="text-h5 px-1">
                    <v-icon icon="mdi-triangle-small-down" size="x-small" class="mr-0" />
                    {{ characterSheet.characterName }}
                  </v-btn>
                </template>
                <v-container class="base-info px-2 pt-2 pb-1">
                  <v-defaults-provider
                    :defaults="{
                      VCol: { class: 'py-0' },
                      VRow: { class: 'py-0 my-0' },
                      VChip: {
                        class: 'px-3 mr-1',
                        size: 'small',
                        variant: 'outlined',
                        style: 'border-color: #666'
                      }
                    }"
                  >
                    <v-row class="mb-1">
                      <v-col>
                        <v-chip :text="characterSheet.level" v-if="characterSheet.level" />
                        <v-chip :text="characterSheet.age" v-if="characterSheet.age" />
                        <v-chip :text="characterSheet.sex" v-if="characterSheet.sex" />
                        <v-chip :text="characterSheet.cover" v-if="characterSheet.cover" />
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                        <v-chip size="large">
                          {{ characterSheet.upperStyle
                          }}{{ characterSheet.subStyle ? ` - ${characterSheet.subStyle}` : '' }}
                        </v-chip>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                        <div class="tree">
                          <ul>
                            <li v-if="characterSheet.stylerule">
                              {{ characterSheet.stylerule }}
                            </li>
                            <li v-if="characterSheet.foe">仇敵：{{ characterSheet.foe }}</li>
                          </ul>
                        </div>
                      </v-col>
                    </v-row>
                  </v-defaults-provider>
                </v-container>
              </v-menu>
              <v-btn
                icon="mdi-open-in-new"
                size="small"
                variant="flat"
                target="_blank"
                rel="noopener noreferrer"
                :href="characterSheet.url"
              />
              <span class="text-body-2"
                >({{ graphQlStore?.state.players.find(p => p.id === playerId)?.name || 'PL未割当' }})</span
              >
            </v-col>
          </v-row>
          <v-row v-if="backgroundView">
            <v-col style="width: 1px; min-width: 250px;">
              <template v-for="(back, idx) in characterSheet.backgroundList" :key="idx">
                <background-chip :text="back.name" :chip="back.effect" :type="back.type" :point="back.point" />
              </template>
            </v-col>
          </v-row>
          <v-row class="pb-2" v-if="ninpouView">
            <v-col>
              <ninpou-table
                class="mr-2"
                :list="characterSheet.ninjaArtsList"
                @click-skill="
                  v => {
                    emits('update:select-skill', v === selectSkill ? '' : v)
                  }
                "
              />
            </v-col>
          </v-row>
        </v-defaults-provider>
      </v-container>
    </v-sheet>
    <v-sheet class="overflow-auto mr-3 mb-3" v-if="tokugiView">
      <speciality-table
        :select-skill="selectSkill"
        @update:select-skill="v => emits('update:select-skill', v)"
        v-model:editing="tokugiTableEditing"
        :info="computedSkills"
        @update:info="v => updateInfo(v)"
        :editable="true"
      />
    </v-sheet>
    <v-sheet class="overflow-auto mt-2 mr-3 mb-3" v-if="textView">
      <character-sheet-tab-view :character-id="characterId" :text-rows="textRows" />
    </v-sheet>
  </v-sheet>
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
import CharacterSheetTabView from '@/components/panes/Shinobigami/CharacterSheetTabView.vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const props = defineProps<{
  characterId: string
  playerId: string
  characterSheet: ShinobiGami
  selectSkill: string
  backgroundView: boolean
  ninpouView: boolean
  tokugiView: boolean
  textView: boolean
  textRows: number
}>()

const computedSkills = computed(() => clone(props.characterSheet.skill))

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
  const characterSheet = clone(props.characterSheet)!
  characterSheet.skill = info
  await graphQlStore.updateShinobigamiCharacter(props.characterId, props.playerId, characterSheet)
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

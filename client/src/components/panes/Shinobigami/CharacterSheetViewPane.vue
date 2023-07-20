<template>
  <pane-frame title="キャラクターシート表示" v-if="characterSheet">
    <template v-slot:title-action>
      <v-btn size="x-small" variant="text" class="bg-transparent" icon="mdi-menu" @click="navigationDrawer = !navigationDrawer"></v-btn>
    </template>
    <template v-slot:layout>
      <v-navigation-drawer
        width="200"
        class="mt-8"
        :scrim="false"
        elevation="0"
        border
        location="right"
        style="border-top: none; z-index: 10000000"
        v-model="navigationDrawer"
      >
        <v-list>
          <v-list-subheader>aaaaa</v-list-subheader>
          <v-list-item>bbbbb</v-list-item>
        </v-list>
      </v-navigation-drawer>
    </template>
    <template v-slot:default>
      <v-sheet>
        <v-container>
          <v-defaults-provider :defaults="{ VCol: { class: 'pa-0' }, VRow: { class: 'pb-2' } }">
            <v-row>
              <v-col>
                <v-menu :close-on-content-click="false">
                  <template v-slot:activator="{props}">
                    <v-btn variant="text" v-bind="props" class="text-h5 px-1">
                      <v-icon icon="mdi-triangle-small-down" size="x-small" class="mr-0" />
                      {{ characterSheet.characterName }}
                    </v-btn>
                  </template>
                  <v-container class="base-info px-2 pt-2 pb-1">
                    <v-defaults-provider :defaults="{
                      VCol: { class: 'py-0' },
                      VRow: { class: 'py-0 my-0' },
                      VChip: { class: 'px-3 mr-1', size: 'small', variant: 'outlined', style: 'border-color: #666' }
                    }">
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
                            {{ characterSheet.upperStyle }}{{ characterSheet.subStyle ? ` - ${characterSheet.subStyle}` : '' }}
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
                  </v-container>
                </v-menu>
                <v-btn icon="mdi-open-in-new" size="small" variant="flat" target="_blank" rel="noopener noreferrer" :href="url" />
                <template v-for="(back, idx) in characterSheet.backgroundList" :key="idx">
                  <background-chip :text="back.name" :chip="back.effect" :type="back.type" :point="back.point" />
                </template>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <ninpou-table
                  class="mx-2"
                  :list="characterSheet.ninjaArtsList"
                  @click-skill="v => { selectSkill = v === selectSkill ? '' : v }"
                />
              </v-col>
            </v-row>
          </v-defaults-provider>
        </v-container>
      </v-sheet>
      <v-sheet class="overflow-auto">
        <speciality-table
          v-model:select-skill="selectSkill"
          v-model:editing="tokugiTableEditing"
          :info="characterSheet.skill"
          @update:info="v => updateInfo(v)"
          :editable="true"
        />
      </v-sheet>
    </template>
  </pane-frame>
</template>

<script lang='ts'>
import { defineComponent } from '@vue/runtime-core'

export default defineComponent({})
//noinspection JSUnusedGlobalSymbols
export const componentInfo = {
  name : 'CharacterSheetViewPane',
  label: 'キャラクターシート表示',
}
</script>

<script setup lang='ts'>
import { Layout } from '@/components/panes'
import SpecialityTable from '@/components/panes/Shinobigami/SpecialityTable.vue'
import { ref, watch } from 'vue'
import { uuid } from 'vue-uuid'
import PaneFrame from '@/components/panes/PaneFrame.vue'
import NinpouTable from '@/components/panes/Shinobigami/NinpouTable.vue'
import BackgroundChip from '@/components/panes/Shinobigami/BackgroundChip.vue'
import {ShinobiGami, ShinobigamiHelper} from '@/components/panes/Shinobigami/shinobigami'
import {SaikoroFictionTokugi} from '@/components/panes/Shinobigami/SaikoroFiction'

const props = defineProps<{
  layout: Layout
  rootLayout: Layout
}>()

const emits = defineEmits<{
  (e: 'change-component', componentGroup: string, component: string): void
  (e: 'change-layout', newLayout: Layout): void
}>()

const navigationDrawer = ref(false)
watch(navigationDrawer, v => {
  if (v) {
    selectSkill.value = ''
  }
})
const url = ref('https://character-sheets.appspot.com/shinobigami/edit.html?key=ahVzfmNoYXJhY3Rlci1zaGVldHMtbXByFwsSDUNoYXJhY3RlckRhdGEY__6wkwEM')

const characterSheet = ref<ShinobiGami | null>(null)

const selectSkill = ref('')
watch(selectSkill, v => {
  console.log(v)
  if (v) {
    navigationDrawer.value = false
  }
})

const tokugiTableEditing = ref(false)
watch(tokugiTableEditing, v => {
  console.log(v)
})

const helper = new ShinobigamiHelper(url.value, 'hilltop')
if (helper.isThis()) {
  helper.getData().then(({ jsons, data }) => {
    console.log(JSON.stringify(data, null, 2))
    // console.log(JSON.stringify(jsons, null, 2))
    characterSheet.value = data
  })
}

function updateInfo(info: SaikoroFictionTokugi) {
  console.log(JSON.stringify(info, null, 2))
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang='scss' scoped>
.abs-menu {
  right: 0;
}
.ninja-style-ex-panel:deep(button) {
  padding: 0;
}

.tree {/*親要素*/
  position: relative;
  font-size: .85rem;
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
  background-image: url("/paint_00001.jpg");
}
</style>

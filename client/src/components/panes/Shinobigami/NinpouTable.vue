<template>
  <table class="ninpou-table bg-white">
    <v-defaults-provider :defaults="{ VIcon: {} }"></v-defaults-provider>
    <thead class="bg-grey-darken-4">
      <tr>
        <th>忍法名</th>
        <th>指定特技</th>
        <th>間</th>
        <th>ｺｽﾄ</th>
      </tr>
    </thead>
    <tbody v-if="list">
      <tr v-for="(arts, idx) in list" :key="idx">
        <v-menu :close-on-content-click="false" :z-index="10000000">
          <template #activator="{ props }">
            <td class="name" v-bind="props">
              <v-icon :icon="getArtsIcon(arts)" style="width: 1.5rem" />
              {{ arts.name }}
            </td>
          </template>
          <v-card class="border" style="max-width: 20rem">
            <v-card-title class="text-pre-wrap">{{ arts.name }}</v-card-title>
            <v-card-text class="pb-2">
              <v-label class="text-caption">効果</v-label>
              <v-sheet class="text-pre-wrap text-body-2">{{ arts.effect || '未記入' }}</v-sheet>
            </v-card-text>
            <v-card-text class="pt-0">
              <v-defaults-provider :defaults="{ VChip: { variant: 'outlined', style: 'border-color: #666' } }">
                <v-chip class="px-3 mr-1" size="small">参照頁: {{ arts.page }}</v-chip>
              </v-defaults-provider>
            </v-card-text>
          </v-card>
        </v-menu>
        <td
          class="target"
          :class="arts.targetSkill === selectSkill ? 'selected' : ''"
          @click="emits('click-skill', arts.targetSkill)"
        >
          {{ arts.targetSkill }}
        </td>
        <td class="range">{{ arts.range }}</td>
        <td class="cost">{{ arts.cost }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { NinjaArts } from '@/components/panes/Shinobigami/shinobigami'

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  list?: NinjaArts[]
  selectSkill: string
  perspective: string
}>()

const emits = defineEmits<{
  (e: 'click-skill', arts: string): void
}>()

function getArtsIcon(arts: NinjaArts) {
  switch (arts.type) {
    case '攻撃':
      return 'mdi-shuriken'
    case 'サポート':
      return 'mdi-script-text mdi-rotate-90'
    case '装備':
      return 'mdi-meditation'
  }
  return ''
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.ninpou-table {
  border-left: 1px solid #aaa;
  border-top: 1px solid #aaa;
  border-right: 2px solid #aaa;
  border-bottom: 2px solid #aaa;
  border-collapse: separate;
  border-spacing: 0;

  th {
    text-align: center !important;
  }

  td {
    text-align: left !important;

    &.range,
    &.cost {
      text-align: center !important;
    }
  }

  th,
  td {
    padding: 0 5px !important;
    line-height: 1em;
    height: 1.8em !important;
    font-size: 14px;
    border-left: 1px solid #aaa;
    border-top: 1px solid #aaa;
    white-space: nowrap;
    user-select: none;

    &.name {
      padding: 0 5px 0 2px !important;
      text-decoration: underline;
      cursor: pointer;
    }

    &.target {
      text-decoration: underline;
      cursor: pointer;
    }

    &.selected {
      outline: red 3px solid;
      outline-offset: -1px;
    }
  }
}

.arts-detail {
  background-image: url('/paint_00001.jpg');
}
</style>

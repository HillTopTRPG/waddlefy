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
          <template v-slot:activator="{ props }">
            <td class="name text-decoration-underline" v-bind="props">
              <v-icon :icon="getArtsIcon(arts)" style="width: 1.5rem" />
              {{ arts.name }}
            </td>
          </template>
          <v-container class="arts-detail px-2 pt-2 pb-1">
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
                  <p class="overflow-auto pa-1" style="white-space: pre; font-size: 0.7em">
                    {{ arts.effect || '効果記載なし' }}
                  </p>
                </v-col>
              </v-row>
              <v-row class="mb-1">
                <v-col>
                  <v-chip>参照p: {{ arts.page }}</v-chip>
                </v-col>
              </v-row>
            </v-defaults-provider>
          </v-container>
        </v-menu>
        <td class="target" @click="emits('click-skill', arts.targetSkill)">
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
    }
  }
}

.arts-detail {
  background-image: url('/paint_00001.jpg');
}
</style>
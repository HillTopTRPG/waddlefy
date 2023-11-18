<template>
  <table class="special-arts-table bg-white">
    <thead class="bg-grey-darken-4">
      <tr>
        <th>奥義名</th>
        <th>指定特技</th>
      </tr>
    </thead>
    <tbody v-if="list">
      <tr v-for="(arts, idx) in list" :key="idx">
        <template v-if="isOpen(arts._id)">
          <v-menu :close-on-content-click="false" scroll-strategy="close" :z-index="10000000">
            <template #activator="{ props }">
              <td class="name" style="min-width: 14em; max-width: 14em" v-bind="props">{{ arts.name }}</td>
            </template>
            <special-arts-card :arts="arts" />
          </v-menu>
          <td
            class="target"
            @click="emits('click-skill', arts.skill)"
            :class="arts.skill === selectSkill ? 'selected' : ''"
          >
            {{ arts.skill }}
          </td>
        </template>
        <template v-else>
          <td style="padding-right: 5px !important">情報なし</td>
          <td>-</td>
        </template>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { SpecialArts } from '@/components/panes/Shinobigami/shinobigami'
import { inject } from 'vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import SpecialArtsCard from '@/components/panes/Shinobigami/SpecialArtsCard.vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  ownerId: string
  list?: SpecialArts[]
  selectSkill: string
  perspective: string
}>()

const emits = defineEmits<{
  (e: 'click-skill', arts: string): void
}>()

function isOpen(artsId: string) {
  if (!props.perspective) return true

  const handout = graphQlStore?.state.sessionDataList.find(sd => sd.id === props.ownerId)
  const character = graphQlStore?.state.sessionDataList.find(sdc => sdc.id === handout?.data.person)
  if (character?.data.player === props.perspective) return true

  return graphQlStore?.state.sessionDataList.some(sd => {
    if (sd.type !== 'shinobigami-handout-relation') return false
    if (sd.data.targetId !== props.ownerId) return false
    if (sd.data.type !== artsId) return false
    const ownerHandout = graphQlStore?.state.sessionDataList.find(sdc => sdc.id === sd.data.ownerId)
    if (!ownerHandout) return false
    const character = graphQlStore?.state.sessionDataList.find(sdc => sdc.id === ownerHandout.data.person)
    if (!character) return false
    return character.data.player === props.perspective
  })
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.special-arts-table {
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
      padding: 0 1px 0 5px !important;
      text-decoration: underline;
      overflow-x: hidden;
      text-overflow: ellipsis;
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
</style>

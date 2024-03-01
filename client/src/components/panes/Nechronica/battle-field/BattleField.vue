<template>
  <v-sheet class="d-flex flex-row w-100 flex-wrap align-start px-1 bg-transparent" style="gap: 5px">
    <table class="battle-field-table">
      <tr>
        <th></th>
        <th v-for="ac in useActionValues" :key="ac">{{ ac }}</th>
      </tr>
      <template v-for="(cl, p) in mapping.CHARACTER_LOCATION" :key="cl.key">
        <tr v-if="p">
          <th>{{ $t(cl.text) }}</th>
          <td v-for="ac in useActionValues" :key="ac">
            <v-sheet class="d-flex flex-row align-center justify-center bg-transparent px-1 character-container">
              <template v-for="c in viewCharacters" :key="c.id">
                <template v-if="c.data.position === p && c.data.actionValue === ac">
                  <battle-field-character
                    :character="c"
                    :perspective="perspective"
                    @click="onClick(c.id)"
                    :selected="c.id === currentCharacterId"
                  />
                </template>
              </template>
            </v-sheet>
          </td>
        </tr>
      </template>
    </table>

    <character-sheet-view
      v-if="currentCharacterId"
      :character-id="currentCharacterId"
      :battle-count="battleCount"
      :battle-timing="battleTiming"
      :view-option="viewOption"
      :perspective="perspective"
    />
  </v-sheet>
</template>

<script setup lang="ts">
import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import BattleFieldCharacter from '@/components/panes/Nechronica/battle-field/BattleFieldCharacter.vue'
import CharacterSheetView from '@/components/panes/Nechronica/character/CharacterSheetView.vue'
import { NechronicaViewOption } from '@/components/panes/Nechronica/component/ViewOptionNav.vue'
import mapping from '@/components/panes/Nechronica/mapping.json'
import { NechronicaType, NechronicaWrap } from '@/components/panes/Nechronica/nechronica'
import { computed, inject, ref } from 'vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const props = defineProps<{
  viewOption: NechronicaViewOption
  battleTiming: string
  battleCount: number
  perspective: string
}>()

const viewCharacters = computed((): { id: string; data: NechronicaWrap }[] => {
  return (
    graphQlStore?.state.sessionDataList
      .filter(sd => {
        if (sd.type !== 'nechronica-character') return false
        return !props.perspective || !sd.data.hide
      })
      .sort((cOne, cTwo) => {
        const cOneType: NechronicaType = cOne.data.type
        const cTwoType: NechronicaType = cTwo.data.type
        if (cOneType === cTwoType) return 0
        if (cOneType === 'doll') return 1
        if (cOneType === 'savant') return -1
        if (cOneType === 'horror') return cTwoType === 'savant' ? 1 : -1
        return cTwoType === 'doll' ? -1 : 1
      }) || []
  )
})

const useActionValues = computed(() => {
  return viewCharacters.value
    .map(vc => vc.data.actionValue)
    .filter((actionValue, idx, arr) => arr.indexOf(actionValue) === idx)
    .sort((vOne, vTwo) => {
      if (vOne > vTwo) return -1
      return vOne < vTwo ? 1 : 0
    })
})

const currentCharacterId = ref<string | null>(null)

function onClick(characterId: string) {
  currentCharacterId.value = currentCharacterId.value === characterId ? null : characterId
}
</script>

<style lang="scss" scoped>
.battle-field-table {
  table-layout: fixed;
  border-spacing: 0;
  border-bottom: solid 1px #ffffff;
  color: black;

  th {
    border-width: 1px;
    border-top-style: solid;
    border-left-style: solid;

    &:first-child {
      min-width: 3em;
      color: white;
      font-size: 1.2em;
      border-left: none;
      text-shadow:
        1px 1px 2px red,
        -1px -1px 2px red,
        0 0 0.5em black,
        0 0 0.5em black;
    }
  }

  td {
    border-width: 1px;
    border-top-style: solid;
    border-left-style: dashed;

    &:first-of-type {
      border-left-style: solid;
    }
  }

  @mixin cellStyle($bg-color, $border-color, $color) {
    th,
    td {
      background-color: $bg-color;
      border-color: $border-color;
    }
    color: $color;
  }

  tr:nth-child(1) {
    @include cellStyle(#000000, #555555, #dddddd);
  }

  tr:nth-child(2) {
    @include cellStyle(#000000, #555555, #cccccc);
  }

  tr:nth-child(3) {
    @include cellStyle(#333333, #666666, #dddddd);
  }

  tr:nth-child(4) {
    @include cellStyle(#666666, #999999, #ffffff);
  }

  tr:nth-child(5) {
    @include cellStyle(#bbbbbb, #dddddd, #000000);
  }

  tr:nth-child(6) {
    @include cellStyle(#dddddd, #ffffff, #333333);
  }

  .character-container {
    min-height: 1em;
    gap: 0.3rem;
  }
}
</style>

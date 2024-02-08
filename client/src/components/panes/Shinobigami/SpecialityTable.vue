<template>
  <v-sheet class="overflow-auto">
    <table class="speciality-table bg-white" :class="`${info ? '' : 'disabled'} ${editing ? 'editing' : ''}`">
      <thead>
        <tr class="bg-grey-darken-4">
          <template v-for="(kind, idx) in SkillKind" :key="idx">
            <th class="blank">
              <v-checkbox
                density="compact"
                :hide-details="true"
                v-if="editing"
                :model-value="info?.spaceList.some(s => s === idx)"
                @update:model-value="v => onChangeBlank(idx, v || false)"
              />
            </th>
            <th>
              <span class="d-flex flex-row align-center justify-space-around">
                <span>{{ kind }}</span>
                <v-checkbox
                  density="compact"
                  :hide-details="true"
                  :model-value="info?.damagedColList.some(c => c === idx)"
                  @update:model-value="v => onChangeDamaged(idx, v || false)"
                />
              </span>
            </th>
          </template>
          <th class="blank"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(skills, idx) in SkillTable" :key="idx">
          <template v-for="i in [...Array(6)].map((_, j) => j)" :key="i">
            <td :class="spaceClass(i)"></td>
            <td
              v-if="targetValues && targetValues.some(tv => tv.name === skills[i])"
              class="bg-amber"
              :class="cellClass(skills[i])"
              @click="onClickSkill(skills[i])"
            >
              >=
              {{ targetValues.find(tv => tv.name === skills[i])?.targetValue }}
            </td>
            <td v-else :class="cellClass(skills[i])" @click="onClickSkill(skills[i])">
              {{ skills[i] }}
            </td>
          </template>
          <td class="blank bg-black">{{ idx + 2 }}</td>
        </tr>
        <tr>
          <td
            colspan="13"
            class="text-left"
            :class="info?.outRow ? 'bg-black' : 'bg-white'"
            style="height: 1em !important"
          >
            <v-checkbox
              v-if="editing"
              density="compact"
              :hide-details="true"
              :model-value="info?.outRow"
              @update:model-value="onChangeOutRow"
            />
          </td>
        </tr>
      </tbody>
    </table>
    <v-radio-group
      :hide-details="true"
      density="compact"
      direction="horizontal"
      :inline="true"
      :model-value="editing"
      @update:model-value="v => emits('update:editing', v || false)"
      v-if="editable"
    >
      <v-radio :value="true" label="設定" density="compact" />
      <v-radio :value="false" label="判定" density="compact" />
    </v-radio-group>
  </v-sheet>
</template>

<script setup lang="ts">
import { clone } from '@/components/panes/Shinobigami/PrimaryDataUtility'
import { SaikoroFictionTokugi } from '@/components/panes/Shinobigami/SaikoroFiction'
import {
  calcTargetValue,
  SkillKind,
  SkillTable,
  TargetValueCalcResult
} from '@/components/panes/Shinobigami/shinobigami'
import { ref, watch } from 'vue'

const props = defineProps<{
  editable: boolean
  editing: boolean
  perspective: string
  selectSkill: string
  info?: SaikoroFictionTokugi
}>()

const emits = defineEmits<{
  (e: 'update:selectSkill', selectSkill: string): void
  (e: 'update:info', info: SaikoroFictionTokugi): void
  (e: 'update:editable', editable: boolean): void
  (e: 'update:editing', editing: boolean): void
}>()

const tokugi = ref(clone<SaikoroFictionTokugi>(props.info || null))
const targetValues = ref<TargetValueCalcResult[] | null>(null)

function changeHandler(notifyParent: boolean = false) {
  if (!tokugi.value) return
  if (notifyParent) emits('update:info', tokugi.value)
}

function updateTargetValue() {
  if (!tokugi.value) return
  targetValues.value = calcTargetValue(props.selectSkill, tokugi.value)
}

watch(
  () => props.selectSkill,
  () => {
    changeHandler()
    updateTargetValue()
  }
)

watch(
  () => props.info,
  () => {
    tokugi.value = clone<SaikoroFictionTokugi>(props.info || null)
    updateTargetValue()
  },
  { deep: true }
)

watch(
  () => props.editing,
  () => {
    emits('update:selectSkill', '')
  }
)

function onClickSkill(skill: string) {
  if (props.editing) {
    if (!tokugi.value) return
    const idx = tokugi.value.learnedList.findIndex(ls => ls.name === skill)
    if (idx < 0) {
      const row = SkillTable.findIndex(r => r.some(c => c === skill))
      const column = SkillTable[row].findIndex(c => c === skill)
      tokugi.value.learnedList.push({ name: skill, row, column })
    } else {
      tokugi.value.learnedList.splice(idx, 1)
    }
    changeHandler(true)
  } else {
    emits('update:selectSkill', props.selectSkill === skill ? '' : skill)
  }
}

function cellClass(skill: string): string {
  const result: string[] = []
  if (skill.length > 4) result.push('font-small')
  if (skill === props.selectSkill) result.push('selected')
  if (props.info?.learnedList.some(lt => lt.name === skill)) result.push('learned')
  return result.join(' ')
}

function spaceClass(idx: number): string {
  const result: string[] = ['blank']
  if (props.info?.spaceList.some(s => s === idx)) result.push('filled')
  return result.join(' ')
}

function onChangeDamaged(col: number, value: boolean) {
  if (!tokugi.value) return
  const idx = tokugi.value.damagedColList.findIndex(c => c === col)
  if (value && idx < 0) {
    tokugi.value.damagedColList.push(col)
    changeHandler(true)
  }
  if (!value && idx >= 0) {
    tokugi.value.damagedColList.splice(idx, 1)
    changeHandler(true)
  }
}

function onChangeBlank(col: number, value: boolean) {
  if (!tokugi.value) return
  const idx = tokugi.value.spaceList.findIndex((c: number) => c === col)
  if (value && idx < 0) {
    tokugi.value?.spaceList.push(col)
    changeHandler(true)
  }
  if (!value && idx >= 0) {
    tokugi.value?.spaceList.splice(idx, 1)
    changeHandler(true)
  }
}

function onChangeOutRow(outRow: boolean | null) {
  if (!tokugi.value) return
  tokugi.value.outRow = outRow || false
  changeHandler(true)
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.speciality-table {
  border-left: 1px solid #aaa;
  border-top: 1px solid #aaa;
  border-right: 2px solid #aaa;
  border-bottom: 2px solid #aaa;
  border-collapse: separate;
  border-spacing: 0;
  color: gray !important;

  &.disabled {
    color: lightgray !important;
  }

  th,
  td {
    padding: 0 2px !important;
    line-height: 1em;
    height: 1.8em !important;
    font-size: 12px;
    border-left: 1px solid #aaa;
    border-top: 1px solid #aaa;
    white-space: nowrap;
    user-select: none;

    &:not(.text-left) {
      text-align: center !important;
    }

    &.font-small {
      font-size: 10px;
    }

    &:not(.blank) {
      min-width: 4.5em;
    }
    &.blank {
      min-width: 1.2em;
      width: 1.2em;
      font-size: 10px;
    }

    &.selected {
      outline: red 3px solid;
      outline-offset: -1px;
    }

    &.filled {
      border-top-color: black;
    }

    &.filled,
    &.learned {
      background-color: black;
      color: white;
    }
  }

  &.editing {
    th,
    td {
      &.blank {
        min-width: 3.2em;
        width: 3.2em;
      }
    }
  }

  tr:first-child td.filled {
    border-top-color: #666;
  }
}

.target-value-tooltip {
  :deep(.v-overlay__content) {
    background-color: #fbd045;
    transform: translateX(-5px);
    padding: 3px 1px 3px 6px;
    line-height: 1em;
    border: 1px solid black;
    z-index: 0;
    width: 3.2em;
    text-align: right;

    &:before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      height: 10px;
      width: 10px;
      margin: auto;
      background-color: #fbd045;
      border: 1px solid black;
      transform: translateX(-50%) rotate(45deg);
    }

    &:after {
      content: '';
      position: absolute;
      left: 0;
      top: 3px;
      bottom: 3px;
      width: 7px;
      margin: auto;
      background-color: #fbd045;
    }
  }
}

:deep(.v-selection-control) {
  min-height: auto !important;
}
</style>

<template>
  <v-sheet
    class="w-100 d-flex flex-row flex-wrap align-end position-sticky pa-1"
    style="gap: 0.5rem; top: 0; z-index: 1"
  >
    <multi-select-menu
      v-if="!perspective"
      :title="$t('Nechronica.label.start-battle')"
      :items="battleOption.battleStart"
      :color="battleOption.battleStartColor"
      @execute="onBattleStart"
    />
    <span class="d-flex flex-row align-end pb-1">
      <span class="text-caption" style="line-height: 1em">{{ $t('Nechronica.label.count') }}:</span>
      <span class="text-h5" style="line-height: 1em">{{ singleton?.data.battleCount || 0 }}</span>
    </span>
    <v-select-thin
      prefix="T"
      :items="mapping.BATTLE_TIMING.map(d => ({ value: d.value, text: $t(d.text) }))"
      item-value="value"
      item-title="text"
      style="max-width: 9.5em"
      :model-value="battleTiming"
      @update:model-value="v => emits('update:battle-timing', v)"
    />
    <multi-select-menu
      v-if="!perspective && singleton?.data.battleCount"
      :title="$t('Nechronica.label.down-count')"
      :color="battleOption.countDownColor"
      :items="battleOption.countDown"
      @execute="onCountDown"
    />
    <multi-select-menu
      v-if="!perspective"
      :title="$t('Nechronica.label.next-turn')"
      :items="battleOption.nextTurn"
      :color="battleOption.nextTurnColor"
      @execute="onNextTurn"
    />
  </v-sheet>
</template>

<script setup lang="ts">
import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import MultiSelectMenu from '@/components/panes/Nechronica/component/MultiSelectMenu.vue'
import VSelectThin from '@/components/panes/Nechronica/component/VSelectThin.vue'
import mapping from '@/components/panes/Nechronica/mapping.json'
import { NechronicaSingleton, NechronicaWrap, getActionValueNum } from '@/components/panes/Nechronica/nechronica'
import { clone } from '@/components/panes/PrimaryDataUtility'
import { computed, inject } from 'vue'
import { useI18n } from 'vue-i18n'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const { t } = useI18n()

defineProps<{
  battleTiming: string
  perspective: string
}>()

const emits = defineEmits<{
  (e: 'update:progress', progress: number): void
  (e: 'update:battle-timing', battleTiming: string): void
}>()

const singleton = computed((): { id: string; data: NechronicaSingleton } | undefined =>
  graphQlStore?.state.sessionDataList.find(sd => sd.type === 'nechronica-singleton')
)

function updateProgress(total: number, current: number) {
  emits('update:progress', Math.round((current * 100) / total))
}

function getMaxActionValues(characterId: string, data: NechronicaWrap): number[] {
  if (data.type === 'legion') return [data.maxActionValue, data.maxActionValue]
  const hasBravado = data.character.maneuverList.some(m => m.isBravado)
  const dependenceRoiceNum = data.character.roiceList.filter(r => r.damage === 4 && r.id % 10 === 3).length
  const characterType = graphQlStore?.state.sessionDataList.find(sd => sd.id === characterId)?.data.type
  const otherInsanityRoice: number =
    graphQlStore?.state.sessionDataList
      .filter(sd => sd.type === 'nechronica-character' && sd.id !== characterId && sd.data.type === 'doll')
      .map(({ data }: { data: NechronicaWrap }): number => {
        return data.character.roiceList.filter(r => r.damage === 4 && [10, 30].includes(r.id)).length
      })
      .reduce((p, c) => p + c, 0) || 0
  const minusValue = characterType === 'doll' ? dependenceRoiceNum * 2 + otherInsanityRoice : 0

  function getManeuverValue(ignoreBravadoFlg: boolean) {
    return data.character.maneuverList.reduce((p, c) => {
      if (c.type !== 3) return p
      const actionValue = getActionValueNum(c.memo)
      if (!c.lost) return p + actionValue
      if (ignoreBravadoFlg || !hasBravado || c.ignoreBravado) return p
      return p + actionValue
    }, 6)
  }
  return [getManeuverValue(true) - minusValue, getManeuverValue(false) - minusValue]
}

type BattleDataWrap = {
  id: string
  isOverCount: boolean
  downActionValue: number
  usedActionManeuverNum: number
  maxActionValues: number[]
  usedManeuverNum: number
  ignoreBravadoManeuverNum: number
  afterPosition: number | null
  data: NechronicaWrap
}

function getBattleDataInfo() {
  const targets: BattleDataWrap[] = []
  const battleCount = singleton.value?.data.battleCount || 0
  let maxAllActionValues = [0, 0]
  let usedManeuverCharacterNum = 0
  let ignoreBravadoCharacterNum = 0
  let afterBattleCount = 0
  let overCountNum = 0
  let usedActionManeuverCharacterNum = 0
  let maxAllCurrentActionValue = Number.MIN_SAFE_INTEGER
  graphQlStore?.state.sessionDataList.forEach(sd => {
    if (sd.type !== 'nechronica-character') return
    const nechronicaWrap: NechronicaWrap = sd.data
    const maneuverList = nechronicaWrap.character.maneuverList
    const hasBravado = maneuverList.some(m => m.isBravado)
    const position = nechronicaWrap.position
    const afterPosition = nechronicaWrap.character.basic.basePosition + 3
    const nextActionValue = Math.min(nechronicaWrap.actionValue, battleCount - 1)
    afterBattleCount = Math.max(afterBattleCount, nextActionValue, 0)

    const pushObj: BattleDataWrap = {
      ...clone<{ id: string; data: NechronicaWrap }>(sd)!,
      isOverCount: battleCount <= nechronicaWrap.actionValue,
      downActionValue: Math.max(nechronicaWrap.actionValue - nextActionValue, 0),
      usedActionManeuverNum: nechronicaWrap.character.maneuverList.filter(m => m.timing === 1 && m.used).length,
      maxActionValues: getMaxActionValues(sd.id, nechronicaWrap),
      usedManeuverNum: maneuverList.filter(m => m.used).length,
      ignoreBravadoManeuverNum: hasBravado ? maneuverList.filter(m => m.lost && !m.ignoreBravado).length : 0,
      afterPosition: position === afterPosition ? null : afterPosition
    }
    maxAllActionValues[0] = Math.max(maxAllActionValues[0], pushObj.maxActionValues[0])
    maxAllActionValues[1] = Math.max(maxAllActionValues[1], pushObj.maxActionValues[1])
    if (pushObj.usedManeuverNum) usedManeuverCharacterNum++
    if (pushObj.ignoreBravadoManeuverNum) ignoreBravadoCharacterNum++
    if (pushObj.isOverCount) overCountNum++
    if (pushObj.usedActionManeuverNum) usedActionManeuverCharacterNum++
    maxAllCurrentActionValue = Math.max(maxAllCurrentActionValue, nechronicaWrap.actionValue)
    targets.push(pushObj)
  })
  return {
    usedManeuverCharacterNum,
    ignoreBravadoCharacterNum,
    targets,
    battleCount,
    maxAllActionValues,
    downBattleCount: battleCount - afterBattleCount,
    afterBattleCount,
    usedActionManeuverCharacterNum,
    overCountNum,
    maxAllCurrentActionValue
  }
}

type OptionItem = { text: string; value: string; color: string }

function makeUseOptionItem(base: string, value: number | boolean): OptionItem | null {
  if (!value) return null
  const optionItems: { [key: string]: OptionItem } = mapping.optionItems
  return {
    ...optionItems[base],
    text: t(optionItems[base].text).replace('$$', value.toString())
  }
}

function makeUseOptionItemSimple(base: string): OptionItem {
  const optionItems: { [key: string]: OptionItem } = mapping.optionItems
  return {
    ...optionItems[base],
    text: t(optionItems[base].text)
  }
}

const battleOption = computed(
  (): {
    battleStart: OptionItem[]
    battleStartColor: string
    countDown: OptionItem[]
    countDownColor: string
    nextTurn: OptionItem[]
    nextTurnColor: string
  } => {
    const {
      targets,
      ignoreBravadoCharacterNum,
      usedManeuverCharacterNum,
      downBattleCount,
      usedActionManeuverCharacterNum,
      overCountNum,
      maxAllCurrentActionValue
    } = getBattleDataInfo()
    const deleteCharacterHistoryFlg = Boolean(singleton.value?.data.maneuverStack?.length)
    const unOpenPawns = targets.filter(t => t.data.type !== 'doll' && t.data.hide)

    const battleStart = [
      makeUseOptionItem('open-underling', unOpenPawns.length),
      makeUseOptionItem('exempt-damaged-maneuvers-from-the-bravado', ignoreBravadoCharacterNum),
      makeUseOptionItemSimple('init-everybody-action-value'),
      makeUseOptionItemSimple('move-everybody-init-location'),
      makeUseOptionItemSimple('init-battle-count'),
      makeUseOptionItem('all-maneuver-to-unused', usedManeuverCharacterNum),
      makeUseOptionItem('delete-character-history', deleteCharacterHistoryFlg)
    ].filter((item): item is OptionItem => Boolean(item))

    const countDown = [
      makeUseOptionItem('down-count-of', downBattleCount),
      makeUseOptionItem('all-action-maneuver-to-unused', usedActionManeuverCharacterNum),
      makeUseOptionItem('delete-character-history', deleteCharacterHistoryFlg),
      makeUseOptionItem('down-un-action-character-action-value', overCountNum)
    ].filter((item): item is OptionItem => Boolean(item))

    const nextTurn = [
      makeUseOptionItem('all-action-values-above-0-to-0', maxAllCurrentActionValue > 0),
      makeUseOptionItem('exempt-damaged-maneuvers-from-the-bravado', ignoreBravadoCharacterNum),
      makeUseOptionItem('all-action-maneuver-to-unused', usedActionManeuverCharacterNum),
      makeUseOptionItemSimple('recover-action-value-by-max-action-value'),
      makeUseOptionItem('delete-character-history', deleteCharacterHistoryFlg),
      makeUseOptionItemSimple('reset-battle-count')
    ].filter((item): item is OptionItem => Boolean(item))

    return {
      battleStart,
      battleStartColor: 'secondary',
      countDown,
      countDownColor: overCountNum ? 'warning' : 'secondary',
      nextTurn,
      nextTurnColor: maxAllCurrentActionValue ? 'warning' : 'secondary'
    }
  }
)

async function onBattleStart(option: string[]) {
  const { targets, maxAllActionValues } = getBattleDataInfo()

  const execOpenPawns = option.includes('open-pawns')
  const execInitActionValue = option.includes('init-action-value')
  const execInitPosition = option.includes('init-position')
  const execInitManeuverUsed = option.includes('init-maneuver-used')
  const execIgnoreBravado = option.includes('ignore-bravado')
  const execInitCount = option.includes('init-count')
  const execClearManeuverStack = option.includes('clear-maneuver-stack')

  const acIdx = execIgnoreBravado ? 0 : 1

  const updateList = targets.filter(target => {
    if (execOpenPawns && target.data.type !== 'doll' && target.data.hide) return true
    if (execInitActionValue && target.data.actionValue !== target.maxActionValues[acIdx]) return true
    if (execInitPosition && target.afterPosition !== null) return true
    if (execInitManeuverUsed && target.usedManeuverNum) return true
    return execIgnoreBravado && target.ignoreBravadoManeuverNum > 0
  })

  const total = updateList.length + (execInitCount || execClearManeuverStack ? 1 : 0)
  let count = 0

  for (const c of updateList) {
    updateProgress(total, count)
    count++

    await graphQlStore?.updateNechronicaCharacterHelper(c.id, cloned => {
      if (execOpenPawns && cloned.type !== 'doll' && cloned.hide) cloned.hide = false
      if (execInitActionValue) cloned.actionValue = c.maxActionValues[acIdx]
      if (execInitPosition && c.afterPosition !== null) cloned.position = c.afterPosition
      if (execInitManeuverUsed || execIgnoreBravado) {
        cloned.character.maneuverList.forEach(m => {
          if (execInitManeuverUsed) m.used = false
          if (execIgnoreBravado && m.lost && !m.ignoreBravado) m.ignoreBravado = true
        })
      }
    })
  }

  if (execInitCount || execClearManeuverStack) {
    updateProgress(total, count)
    count++
    await graphQlStore?.updateSingletonHelper<NechronicaSingleton>(d => {
      const result: NechronicaSingleton = {
        ...d
      }
      if (execInitCount) result.battleCount = maxAllActionValues[acIdx]
      if (execClearManeuverStack) result.maneuverStack = []
      return result
    })
  }
  if (total) updateProgress(total, count)
}

async function onCountDown(option: string[]) {
  const { targets, afterBattleCount } = getBattleDataInfo()

  const execCountDown = option.includes('count-down')
  const execClearManeuverStack = option.includes('clear-maneuver-stack')
  const execCharacterCountDown = option.includes('character-count-down')
  const execRecoveryActionManeuver = option.includes('recovery-action-maneuver')

  const updateList = targets.filter(t => {
    if (execCharacterCountDown && t.downActionValue) return true
    return execRecoveryActionManeuver && t.usedActionManeuverNum
  })

  const total = (execCountDown || execClearManeuverStack ? 1 : 0) + updateList.length
  let count = 0

  if (execCountDown || execClearManeuverStack) {
    updateProgress(total, count)
    count++

    graphQlStore?.updateSingletonHelper(d => {
      const result: NechronicaSingleton = {
        ...d
      }
      if (execCountDown) result.battleCount = afterBattleCount
      if (execClearManeuverStack) result.maneuverStack = []
      return result
    })
  }

  for (const c of updateList) {
    updateProgress(total, count)
    count++

    await graphQlStore?.updateNechronicaCharacterHelper(c.id, cloned => {
      if (execCharacterCountDown) {
        cloned.actionValue -= c.downActionValue
      }
      if (execRecoveryActionManeuver) {
        cloned.character.maneuverList.filter(m => m.timing === 1).forEach(m => (m.used = false))
      }
    })
  }
  if (total) updateProgress(total, count)
}

async function onNextTurn(option: string[]) {
  const { targets } = getBattleDataInfo()
  const execResetActionValue = option.includes('reset-action-value')
  const execIgnoreBravado = option.includes('ignore-bravado')
  const execRecoveryActionManeuver = option.includes('recovery-action-maneuver')
  const execActionValueRecovery = option.includes('action-value-recovery')
  const execClearManeuverStack = option.includes('clear-maneuver-stack')
  const execResetCount = option.includes('reset-count')

  const acIdx = execIgnoreBravado ? 0 : 1

  const updateList = targets.filter(t => {
    if (execResetActionValue && t.data.actionValue > 0) return true
    if (execIgnoreBravado && t.ignoreBravadoManeuverNum) return true
    if (execRecoveryActionManeuver && t.usedActionManeuverNum) return true
    return execActionValueRecovery
  })

  const total = (execResetCount || execClearManeuverStack ? 1 : 0) + updateList.length
  let count = 0

  let maxAllActionValue = 0

  for (const c of updateList) {
    updateProgress(total, count)
    count++

    await graphQlStore?.updateNechronicaCharacterHelper(c.id, cloned => {
      if (execResetActionValue && cloned.actionValue > 0) cloned.actionValue = 0
      if (execIgnoreBravado && c.ignoreBravadoManeuverNum) {
        cloned.character.maneuverList.filter(m => m.lost && !m.ignoreBravado).forEach(m => (m.ignoreBravado = true))
      }
      if (execRecoveryActionManeuver) {
        cloned.character.maneuverList.filter(m => m.timing === 1).forEach(m => (m.used = false))
      }
      if (execActionValueRecovery) cloned.actionValue += c.maxActionValues[acIdx]

      maxAllActionValue = Math.max(maxAllActionValue, cloned.actionValue)
    })
  }

  if (execResetCount || execClearManeuverStack) {
    updateProgress(total, count)
    count++

    graphQlStore?.updateSingletonHelper(d => {
      const result: NechronicaSingleton = {
        ...d
      }
      if (execResetCount) result.battleCount = maxAllActionValue
      if (execClearManeuverStack) result.maneuverStack = []
      return result
    })
  }

  if (total) updateProgress(total, count)
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>

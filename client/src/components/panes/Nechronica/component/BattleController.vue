<template>
  <v-sheet class="w-100 d-flex flex-row flex-wrap position-sticky pa-1" style="gap: 0.5rem; top: 0; z-index: 1">
    <multi-select-menu title="戦闘準備" :items="battleOption.battleStart" @execute="onBattleStart" />
    {{ singleton?.data.battleCount || 0 }}
    <v-select-thin
      prefix="T"
      :items="battleTimingSelection"
      item-value="value"
      item-title="text"
      style="max-width: 9.5em"
      :model-value="battleTiming"
      @update:model-value="v => emits('update:battle-timing', v)"
    />
    <multi-select-menu
      v-if="singleton?.data.battleCount"
      title="カウント減少"
      :items="battleOption.countDown"
      @execute="onCountDown"
    />
    <multi-select-menu title="次ターン開始" :items="battleOption.nextTurn" @execute="onNextTurn" />
  </v-sheet>
</template>

<script setup lang="ts">
// eslint-disable-next-line unused-imports/no-unused-vars
import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import MultiSelectMenu from '@/components/panes/Nechronica/component/MultiSelectMenu.vue'
import VSelectThin from '@/components/panes/Nechronica/component/VSelectThin.vue'
import { NechronicaSingleton, NechronicaWrap, getActionValueNum } from '@/components/panes/Nechronica/nechronica'
import { clone } from '@/components/panes/PrimaryDataUtility'
import { computed, inject } from 'vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

defineProps<{
  battleTiming: string
}>()

const emits = defineEmits<{
  (e: 'update:progress', progress: number): void
  (e: 'update:battle-timing', battleTiming: string): void
}>()

const battleTimingSelection = [
  { value: '', text: '無指定' },
  { value: 'action', text: 'アクション' },
  { value: 'rapid', text: 'ラピッド' },
  { value: 'judge', text: 'ジャッジ' },
  { value: 'damage', text: 'ダメージ' }
]

const singleton = computed(
  (): { id: string; data: NechronicaSingleton } | undefined =>
    graphQlStore?.state.sessionDataList.find(sd => sd.type === 'singleton')
)

function updateProgress(total: number, current: number) {
  emits('update:progress', Math.round((current * 100) / total))
}

function getMaxActionValues(characterId: string, data: NechronicaWrap): number[] {
  if (data.type === 'legion') return [data.maxActionValue, data.maxActionValue]
  const hasHeiki = data.character.maneuverList.some(m => m.isHeiki)
  const dependenceRoiceNum = data.character.roiceList.filter(r => r.damage === 4 && r.id % 10 === 3).length
  const otherInsanityRoice: number =
    graphQlStore?.state.sessionDataList
      .filter(sd => sd.type === 'nechronica-character' && sd.id !== characterId && sd.data.type === 'doll')
      .map(({ data }: { data: NechronicaWrap }): number => {
        return data.character.roiceList.filter(r => r.damage === 4 && [10, 30].includes(r.id)).length
      })
      .reduce((p, c) => p + c, 0) || 0
  const minusValue = dependenceRoiceNum * 2 + otherInsanityRoice

  function getManeuverValue(ignoreHeikiFlg: boolean) {
    return data.character.maneuverList.reduce((p, c) => {
      if (c.type !== 3) return p
      const actionValue = getActionValueNum(c.memo)
      if (!c.lost) return p + actionValue
      if (ignoreHeikiFlg || !hasHeiki || c.ignoreHeiki) return p
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
  ignoreHeikiManeuverNum: number
  afterPosition: number | null
  data: NechronicaWrap
}

function getBattleDataInfo() {
  console.log('########################################')
  console.log('getBattleDataInfo')
  console.log('########################################')
  const targets: BattleDataWrap[] = []
  const battleCount = singleton.value?.data.battleCount || 0
  let maxAllActionValues = [0, 0]
  let usedManeuverCharacterNum = 0
  let ignoreHeikiCharacterNum = 0
  let afterBattleCount = 0
  let overCountNum = 0
  let usedActionManeuverCharacterNum = 0
  let maxAllCurrentActionValue = Number.MIN_SAFE_INTEGER
  graphQlStore?.state.sessionDataList.forEach(sd => {
    if (sd.type !== 'nechronica-character') return
    const nechronicaWrap: NechronicaWrap = sd.data
    const maneuverList = nechronicaWrap.character.maneuverList
    const hasHeiki = maneuverList.some(m => m.isHeiki)
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
      ignoreHeikiManeuverNum: hasHeiki ? maneuverList.filter(m => m.lost && !m.ignoreHeiki).length : 0,
      afterPosition: position === afterPosition ? null : afterPosition
    }
    maxAllActionValues[0] = Math.max(maxAllActionValues[0], pushObj.maxActionValues[0])
    maxAllActionValues[1] = Math.max(maxAllActionValues[1], pushObj.maxActionValues[1])
    if (pushObj.usedManeuverNum) usedManeuverCharacterNum++
    if (pushObj.ignoreHeikiManeuverNum) ignoreHeikiCharacterNum++
    if (pushObj.isOverCount) overCountNum++
    if (pushObj.usedActionManeuverNum) usedActionManeuverCharacterNum++
    maxAllCurrentActionValue = Math.max(maxAllCurrentActionValue, nechronicaWrap.actionValue)
    targets.push(pushObj)
  })
  return {
    usedManeuverCharacterNum,
    ignoreHeikiCharacterNum,
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
const battleOption = computed(
  (): {
    battleStart: OptionItem[]
    countDown: OptionItem[]
    nextTurn: OptionItem[]
  } => {
    const {
      ignoreHeikiCharacterNum,
      usedManeuverCharacterNum,
      downBattleCount,
      usedActionManeuverCharacterNum,
      overCountNum,
      maxAllCurrentActionValue
    } = getBattleDataInfo()
    const maneuverStackLength = singleton.value?.data.maneuverStack?.length || 0

    const battleStart = [
      ignoreHeikiCharacterNum
        ? {
            value: 'ignore-heiki',
            text: `${ignoreHeikiCharacterNum}体の損傷済マニューバを【平気】の対象外化にする`,
            color: 'warning'
          }
        : null,
      { value: 'init-action-value', text: '全員の行動値の初期化', color: 'primary' },
      { value: 'init-position', text: '全員を初期配置に移動', color: 'primary' },
      { value: 'init-count', text: 'カウントの初期化', color: 'primary' },
      usedManeuverCharacterNum
        ? { value: 'init-maneuver-used', text: `${usedManeuverCharacterNum}体のマニューバの未使用化`, color: 'warning' }
        : null
    ].filter((item): item is OptionItem => Boolean(item))

    const countDown = [
      { value: 'count-down', text: `カウントを${downBattleCount}減らす`, color: 'primary' },
      usedActionManeuverCharacterNum
        ? {
            value: 'recovery-action-maneuver',
            text: `${usedActionManeuverCharacterNum}体のアクションマニューバの未使用化`,
            color: 'primary'
          }
        : null,
      maneuverStackLength ? { value: 'clear-maneuver-stack', text: 'マニューバ履歴の削除', color: 'primary' } : null,
      overCountNum
        ? { value: 'character-count-down', text: `${overCountNum}体の未行動者の行動値を減らす`, color: 'error' }
        : null
    ].filter((item): item is OptionItem => Boolean(item))

    const nextTurn = [
      maxAllCurrentActionValue > 0
        ? { value: 'reset-action-value', text: '0を超える行動値を全て0にする', color: 'error' }
        : null,
      ignoreHeikiCharacterNum
        ? {
            value: 'ignore-heiki',
            text: `${ignoreHeikiCharacterNum}体の損傷済マニューバを【平気】の対象外化にする`,
            color: 'warning'
          }
        : null,
      usedActionManeuverCharacterNum
        ? {
          value: 'recovery-action-maneuver',
          text: `${usedActionManeuverCharacterNum}体のアクションマニューバの未使用化`,
          color: 'primary'
        }
        : null,
      { value: 'action-value-recovery', text: '全員の行動値を最大値分回復する', color: 'primary' },
      maneuverStackLength ? { value: 'clear-maneuver-stack', text: 'マニューバ履歴の削除', color: 'primary' } : null,
      { value: 'reset-count', text: 'カウントの再設定', color: 'primary' }
    ].filter((item): item is OptionItem => Boolean(item))

    return {
      battleStart,
      countDown,
      nextTurn
    }
  }
)

async function onBattleStart(option: string[]) {
  const { targets, maxAllActionValues } = getBattleDataInfo()

  const execInitActionValue = option.includes('init-action-value')
  const execInitPosition = option.includes('init-position')
  const execInitManeuverUsed = option.includes('init-maneuver-used')
  const execIgnoreHeiki = option.includes('ignore-heiki')
  const execInitCount = option.includes('init-count')

  const acIdx = execIgnoreHeiki ? 0 : 1

  const updateList = targets.filter(target => {
    if (execInitActionValue && target.data.actionValue !== target.maxActionValues[acIdx]) return true
    if (execInitPosition && target.afterPosition !== null) return true
    if (execInitManeuverUsed && target.usedManeuverNum) return true
    return execIgnoreHeiki && target.ignoreHeikiManeuverNum > 0
  })

  const total = updateList.length + (execInitCount ? 1 : 0)
  let count = 0

  for (const c of updateList) {
    updateProgress(total, count)
    count++

    const cloned = clone<NechronicaWrap>(c.data)!

    if (execInitActionValue) cloned.actionValue = c.maxActionValues[acIdx]
    if (execInitPosition && c.afterPosition !== null) cloned.position = c.afterPosition
    if (execInitManeuverUsed || execIgnoreHeiki) {
      cloned.character.maneuverList.forEach(m => {
        if (execInitManeuverUsed) m.used = false
        if (execIgnoreHeiki && m.lost && !m.ignoreHeiki) m.ignoreHeiki = true
      })
    }
    if (JSON.stringify(cloned) !== JSON.stringify(c.data)) {
      await graphQlStore?.updateNechronicaCharacter(c.id, cloned)
    }
  }

  if (execInitCount) {
    updateProgress(total, count)
    count++
    await graphQlStore?.updateSingletonHelper<NechronicaSingleton>(d => {
      const result: NechronicaSingleton = {
        ...d,
        battleCount: maxAllActionValues[acIdx]
      }
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

    const cloned = clone(c.data)!

    if (execCharacterCountDown) {
      cloned.actionValue -= c.downActionValue
    }
    if (execRecoveryActionManeuver) {
      cloned.character.maneuverList.filter(m => m.timing === 1).forEach(m => (m.used = false))
    }
    if (JSON.stringify(cloned) !== JSON.stringify(c.data)) {
      await graphQlStore?.updateNechronicaCharacter(c.id, cloned)
    }
  }
  if (total) updateProgress(total, count)
}

async function onNextTurn(option: string[]) {
  const { targets } = getBattleDataInfo()
  const execResetActionValue = option.includes('reset-action-value')
  const execIgnoreHeiki = option.includes('ignore-heiki')
  const execRecoveryActionManeuver = option.includes('recovery-action-maneuver')
  const execActionValueRecovery = option.includes('action-value-recovery')
  const execClearManeuverStack = option.includes('clear-maneuver-stack')
  const execResetCount = option.includes('reset-count')

  const acIdx = execIgnoreHeiki ? 0 : 1

  const updateList = targets.filter(t => {
    if (execResetActionValue && t.data.actionValue > 0) return true
    if (execIgnoreHeiki && t.ignoreHeikiManeuverNum) return true
    if (execRecoveryActionManeuver && t.usedActionManeuverNum) return true
    return execActionValueRecovery
  })

  const total = (execResetCount || execClearManeuverStack ? 1 : 0) + updateList.length
  let count = 0

  let maxAllActionValue = 0

  for (const c of updateList) {
    updateProgress(total, count)
    count++

    const cloned = clone(c.data)!

    if (execResetActionValue && cloned.actionValue > 0) cloned.actionValue = 0
    if (execIgnoreHeiki && c.ignoreHeikiManeuverNum) {
      cloned.character.maneuverList.filter(m => m.lost && !m.ignoreHeiki).forEach(m => (m.ignoreHeiki = true))
    }
    if (execRecoveryActionManeuver) {
      cloned.character.maneuverList.filter(m => m.timing === 1).forEach(m => (m.used = false))
    }
    if (execActionValueRecovery) cloned.actionValue += c.maxActionValues[acIdx]

    maxAllActionValue = Math.max(maxAllActionValue, cloned.actionValue)

    if (JSON.stringify(cloned) !== JSON.stringify(c.data)) {
      await graphQlStore?.updateNechronicaCharacter(c.id, cloned)
    }
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

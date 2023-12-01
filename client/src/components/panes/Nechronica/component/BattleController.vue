<template>
  <v-sheet class="w-100 d-flex flex-row flex-wrap position-sticky pa-1" style="gap: 0.5rem; top: 0; z-index: 1">
    <multi-select-menu title="戦闘準備" :items="battleStartOption" @execute="onBattleStart" />
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
      :items="countDownOption"
      @execute="onCountDown"
    />
    <multi-select-menu title="次ターン開始" :items="nextTurnOption" @execute="onNextTurn" />
  </v-sheet>
</template>

<script setup lang="ts">
// eslint-disable-next-line unused-imports/no-unused-vars
import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import MultiSelectMenu from '@/components/panes/Nechronica/component/MultiSelectMenu.vue'
import VSelectThin from '@/components/panes/Nechronica/component/VSelectThin.vue'
import {
  Nechronica,
  NechronicaManeuver,
  NechronicaSingleton,
  NechronicaWrap,
  getActionValueNum
} from '@/components/panes/Nechronica/nechronica'
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

function getMaxActionValue(characterId: string, data: NechronicaWrap, ignoreHeikiFlg: boolean) {
  if (data.type === 'legion') return data.maxActionValue
  const hasHeiki = data.character.maneuverList.some(m => m.isHeiki)
  const dependenceRoiceNum = data.character.roiceList.filter(r => r.damage === 4 && r.id % 10 === 3).length
  const otherInsanityRoice: number =
    graphQlStore?.state.sessionDataList
      .filter(sd => sd.type === 'nechronica-character' && sd.id !== characterId && sd.data.type === 'doll')
      .map(({ data }: { data: NechronicaWrap }): number => {
        return data.character.roiceList.filter(r => r.damage === 4 && [10, 30].includes(r.id)).length
      })
      .reduce((p, c) => p + c, 0) || 0
  const maneuverValue = data.character.maneuverList.reduce((p, c) => {
    if (c.type !== 3) return p
    const actionValue = getActionValueNum(c.memo)
    if (!c.lost) return p + actionValue
    if (ignoreHeikiFlg || !hasHeiki || c.ignoreHeiki) return p
    return p + actionValue
  }, 6)
  return maneuverValue - dependenceRoiceNum * 2 - otherInsanityRoice
}

function getLostManeuverInfoList(): {
  character: { id: string; data: NechronicaWrap }
  lostManeuvers: { idx: number; m: NechronicaManeuver }[]
}[] {
  return (
    graphQlStore?.state.sessionDataList
      .filter(sd => {
        if (sd.type !== 'nechronica-character') return false
        const data: NechronicaWrap = sd.data
        return data.character.maneuverList.some(m => m.isHeiki)
      })
      .map(sd => {
        const data: NechronicaWrap = sd.data
        const lostManeuvers: { idx: number; m: NechronicaManeuver }[] = data.character.maneuverList
          .map((m, idx) => ({ idx, m }))
          .filter(info => info.m.lost && !info.m.ignoreHeiki)
        return {
          character: sd,
          lostManeuvers
        }
      })
      .filter(info => info.lostManeuvers.length) || []
  )
}

const battleStartOption = computed(() => {
  const usedManeuverCharacters: { id: string; data: NechronicaWrap }[] =
    graphQlStore?.state.sessionDataList.filter(sd => {
      if (sd.type !== 'nechronica-character') return false
      const nechronica: NechronicaWrap = sd.data
      return nechronica.character.maneuverList.some(m => m.used)
    }) || []
  const lostManeuverInfoList = getLostManeuverInfoList()
  const lostManeuverNum = lostManeuverInfoList.reduce((p, c) => p + c.lostManeuvers.length, 0)

  return [
    lostManeuverNum
      ? {
          value: 'ignore-heiki',
          text: `${lostManeuverNum}個の損傷済マニューバを【平気】の対象外化にする`,
          color: 'warning'
        }
      : null,
    { value: 'init-action-value', text: '全員の行動値の初期化', color: 'primary' },
    { value: 'init-position', text: '全員を初期配置に移動', color: 'primary' },
    { value: 'init-count', text: 'カウントの初期化', color: 'primary' },
    usedManeuverCharacters.length
      ? { value: 'init-maneuver-used', text: 'マニューバの未使用化', color: 'warning' }
      : null
  ].filter((item): item is { text: string; value: string; color: string } => Boolean(item))
})

async function onBattleStart(option: string[]) {
  console.log(JSON.stringify(option, null, 2))

  const characters = graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'nechronica-character') || []

  const total = (option.includes('init-action-value') ? characters.length : 0) + (option.includes('init-count') ? 1 : 0)
  let count = 0

  let maxAllActionValue = 0

  if (option.some(o => ['ignore-heiki', 'init-action-value', 'init-position', 'init-maneuver-used'].includes(o))) {
    for (const sd of graphQlStore?.state.sessionDataList || []) {
      if (sd.type !== 'nechronica-character') continue
      const cloneObj = clone<NechronicaWrap>(sd.data)!

      const maxActionValue = getMaxActionValue(sd.id, cloneObj, option.includes('ignore-heiki'))
      if (maxAllActionValue < maxActionValue) {
        maxAllActionValue = maxActionValue
      }

      if (option.includes('init-action-value')) {
        cloneObj.actionValue = maxActionValue
      }

      if (option.includes('init-position')) {
        cloneObj.position = cloneObj.character.basic.basePosition + 3
      }

      if (option.includes('init-maneuver-used') || option.includes('ignore-heiki')) {
        cloneObj.character.maneuverList.forEach(m => {
          if (option.includes('init-maneuver-used')) {
            m.used = false
          }
          if (option.includes('ignore-heiki') && m.lost && !m.ignoreHeiki) {
            m.ignoreHeiki = true
          }
        })
      }

      updateProgress(total, count)
      count++
      await graphQlStore?.updateNechronicaCharacter(sd.id, cloneObj)
    }
  }
  if (option.includes('init-count')) {
    if (maxAllActionValue === 0) {
      maxAllActionValue =
        graphQlStore?.state.sessionDataList.reduce((p, c) => {
          if (c.type !== 'nechronica-character') return p
          return p + getMaxActionValue(c.id, c.data, option.includes('ignore-heiki'))
        }, 0) || 0
    }
    updateProgress(total, count)
    count++
    await graphQlStore?.updateSingletonHelper<NechronicaSingleton>(d => {
      const result: NechronicaSingleton = {
        ...d,
        battleCount: maxAllActionValue
      }
      return result
    })
  }
  if (total) updateProgress(total, count)
}

const countDownOption = computed(() => {
  const battleCount = singleton.value?.data.battleCount || 0
  const overCharacter =
    graphQlStore?.state.sessionDataList.filter(sd => {
      if (sd.type !== 'nechronica-character') return false
      return sd.data.actionValue >= battleCount
    }) || []
  return [
    { value: 'count-down', text: 'カウントを１減らす', color: 'primary' },
    { value: 'recovery-action-maneuver', text: 'アクションマニューバの未使用化', color: 'primary' },
    overCharacter.length
      ? { value: 'character-count-down', text: `${overCharacter.length}体の未行動者の行動値を減らす`, color: 'error' }
      : null
  ].filter((item): item is { value: string; text: string; color: string } => Boolean(item))
})
async function onCountDown(option: string[]) {
  const battleCount = singleton.value?.data.battleCount || 0
  const targetCharacters: { id: string; data: NechronicaWrap }[] =
    graphQlStore?.state.sessionDataList.filter(sd => {
      if (sd.type !== 'nechronica-character') return false
      if (option.includes('character-count-down') && sd.data.actionValue >= battleCount) return true
      const nechronica: Nechronica = sd.data.character
      return option.includes('recovery-action-maneuver') && nechronica.maneuverList.some(m => m.timing === 1 && m.used)
    }) || []

  const total = (option.includes('count-down') ? 1 : 0) + targetCharacters.length
  let count = 0

  if (option.includes('count-down')) {
    updateProgress(total, count)
    count++
    graphQlStore?.updateSingletonHelper(d => {
      const result: NechronicaSingleton = {
        ...d,
        battleCount: battleCount - 1
      }
      return result
    })
  }
  for (const c of targetCharacters) {
    updateProgress(total, count)
    count++
    const cloned = clone(c.data)!
    if (option.includes('character-count-down') && cloned.actionValue >= battleCount) {
      cloned.actionValue = battleCount - 1
    }
    if (option.includes('recovery-action-maneuver')) {
      cloned.character.maneuverList.forEach(m => {
        if (m.timing === 1) {
          m.used = false
        }
      })
    }
    await graphQlStore?.updateNechronicaCharacter(c.id, cloned)
  }
  if (total) updateProgress(total, count)
  console.log(JSON.stringify(option, null, 2))
}

const nextTurnOption = computed(() => {
  const battleCount = singleton.value?.data.battleCount || 0
  const lostManeuverInfoList = getLostManeuverInfoList()
  const lostManeuverNum = lostManeuverInfoList.reduce((p, c) => p + c.lostManeuvers.length, 0)
  return [
    battleCount ? { value: 'reset-action-value', text: '0を超える行動値を全て0にする', color: 'error' } : null,
    { value: 'action-value-recovery', text: '全員の行動値を最大値分回復する', color: 'primary' },
    lostManeuverNum
      ? {
          value: 'ignore-heiki',
          text: `${lostManeuverNum}個の損傷済マニューバを【平気】の対象外化にする`,
          color: 'warning'
        }
      : null
  ].filter((item): item is { text: string; value: string; color: string } => Boolean(item))
})
function onNextTurn(option: string[]) {
  console.log(JSON.stringify(option, null, 2))
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>

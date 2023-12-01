<template>
  <v-sheet class="px-0" :class="battleTargetClass[isBattleTarget]">
    <icon-btn
      :class="classText"
      :disable-button="disableButton"
      :text="mode === 'normal' ? maneuver.name : ''"
      :under-text="text"
      :activate-props="activateProps || {}"
    />
  </v-sheet>
</template>

<script setup lang="ts">
import IconBtn from '@/components/panes/Nechronica/maneuver/IconBtn.vue'
import { NechronicaManeuver, NechronicaTimingList } from '@/components/panes/Nechronica/nechronica'
import { computed } from 'vue'

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  maneuver: NechronicaManeuver
  disableButton?: boolean
  activateProps?: any
  size: 'x-small' | 'small' | 'normal'
  mode: 'normal' | 'simple' | 'icon'
  viewLabel?: keyof NechronicaManeuver | ''
  battleTiming?: string
}>()

const battleTargetClass = ['bg-transparent', 'bg-cyan-lighten-4', 'bg-yellow-accent-2']
const text = computed(() => {
  if (!props.viewLabel) return ''
  const value = props.maneuver[props.viewLabel]
  if (props.viewLabel === 'timing') {
    return NechronicaTimingList[value as number].text
  }
  return value?.toString() || ''
})

const isBattleTarget = computed((): number => {
  if (!props.battleTiming || props.maneuver.type === 3) return 0
  if (props.battleTiming === 'action') {
    if (props.maneuver.timing === 1) return 2
    return [0, 4].includes(props.maneuver.timing) ? 1 : 0
  }
  if (props.battleTiming === 'rapid') {
    if (props.maneuver.timing === 4) return 2
    return props.maneuver.timing === 0 ? 1 : 0
  }
  if (props.battleTiming === 'judge') {
    if (props.maneuver.timing === 2) return 2
    return props.maneuver.timing === 0 ? 1 : 0
  }
  // damage
  if (props.maneuver.timing === 3) return 2
  return props.maneuver.timing === 0 ? 1 : 0
})

const shozokuClassMap = [
  { text: '武装', class: 'armed' },
  { text: '変異', class: 'mutation' },
  { text: '改造', class: 'modification' },
  { text: 'アリス', class: 'alice' },
  { text: 'ｱﾘｽ', class: 'alice' },
  { text: 'ホリック', class: 'holic' },
  { text: 'ﾎﾘｯｸ', class: 'holic' },
  { text: 'オートマトン', class: 'automaton' },
  { text: 'ｵｰﾄﾏﾄﾝ', class: 'automaton' },
  { text: 'ジャンク', class: 'junk' },
  { text: 'ｼﾞｬﾝｸ', class: 'junk' },
  { text: 'コート', class: 'coat' },
  { text: 'ｺｰﾄ', class: 'coat' },
  { text: 'ソロリティ', class: 'sorority' },
  { text: 'ｿﾛﾘﾃｨ', class: 'sorority' },
  { text: 'サイケデリック', class: 'psychedelic' },
  { text: 'ｻｲｹﾃﾞﾘｯｸ', class: 'psychedelic' },
  { text: 'ステーシー', class: 'stacy' },
  { text: 'ｽﾃｰｼｰ', class: 'stacy' },
  { text: 'タナトス', class: 'thanatos' },
  { text: 'ﾀﾅﾄｽ', class: 'thanatos' },
  { text: 'ゴシック', class: 'gothic' },
  { text: 'ｺﾞｼｯｸ', class: 'gothic' },
  { text: 'レクイエム', class: 'requiem' },
  { text: 'ﾚｸｲｴﾑ', class: 'requiem' },
  { text: 'バロック', class: 'baroque' },
  { text: 'ﾊﾞﾛｯｸ', class: 'baroque' },
  { text: 'ロマネスク', class: 'romanesque' },
  { text: 'ﾛﾏﾈｽｸ', class: 'romanesque' },
  { text: 'たからもの', class: 'treasure' },
  { text: 'タカラモノ', class: 'treasure' },
  { text: 'ﾀｶﾗﾓﾉ', class: 'treasure' }
]

const basicPartsClassMap = [
  { text: 'のうみそ', class: 'basic-brain' },
  { text: 'めだま', class: 'basic-eye' },
  { text: 'あご', class: 'basic-jaw' },
  { text: 'こぶし', class: 'basic-fist' },
  { text: 'うで', class: 'basic-arm' },
  { text: 'かた', class: 'basic-shoulder' },
  { text: 'せぼね', class: 'basic-backbone' },
  { text: 'はらわた', class: 'basic-viscera' },
  { text: 'ほね', class: 'basic-bone' },
  { text: 'あし', class: 'basic-leg' }
]

const partClassMap = ['', 'skill', 'skill', 'skill', 'head', 'arm', 'body', 'leg']

const classText = computed(() => {
  const result: string[] = ['']

  if (props.size !== 'normal') {
    result.push(props.size)
  }

  if (props.mode === 'normal') {
    if (props.maneuver.lost) {
      result.push('lost')
    } else if (props.maneuver.used) {
      result.push('used')
    }
  }

  if (props.mode !== 'simple') {
    result.push(`type${props.maneuver.type}`)
  }

  result.push(partClassMap[props.maneuver.parts] || '')

  const basicClass = basicPartsClassMap.find(b => b.text === props.maneuver.name)?.class || ''
  if (basicClass) {
    result.push(basicClass)
  } else {
    const shozokuClass = shozokuClassMap.find(sc => props.maneuver.shozoku.includes(sc.text))?.class || ''
    result.push(shozokuClass)
  }

  return result.join(' ')
})
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
<template>
  <nechronica-icon-btn
    :class="classText"
    :disable-button="disableButton"
    :text="maneuver.name"
    :under-text="text"
    :activate-props="activateProps || {}"
  />
</template>

<script setup lang="ts">
import NechronicaIconBtn from '@/components/panes/Nechronica/NechronicaIconBtn.vue'
import { NechronicaManeuver, NechronicaTimingList } from '@/components/panes/Nechronica/nechronica'
import { computed } from 'vue'

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  maneuver: NechronicaManeuver
  disableButton?: boolean
  activateProps?: any
  viewLabel?: keyof NechronicaManeuver | ''
}>()

const text = computed(() => {
  if (!props.viewLabel) return ''
  const value = props.maneuver[props.viewLabel]
  if (props.viewLabel === 'timing') {
    return NechronicaTimingList[value]
  }
  return value || ''
})

const shozokuClassMap = [
  { text: '基本', class: 'basic' },
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
  { text: 'たからもの', class: 'treasure' },
  { text: 'タカラモノ', class: 'treasure' },
  { text: 'ﾀｶﾗﾓﾉ', class: 'treasure' }
]

const basicPartsClassMap = [
  { text: 'のうみそ', class: 'brain' },
  { text: 'めだま', class: 'eye' },
  { text: 'あご', class: 'jaw' },
  { text: 'こぶし', class: 'fist' },
  { text: 'うで', class: 'arm' },
  { text: 'かた', class: 'shoulder' },
  { text: 'せぼね', class: 'backbone' },
  { text: 'はらわた', class: 'viscera' },
  { text: 'ほね', class: 'bone' },
  { text: 'あし', class: 'leg' }
]

const partClassMap = ['', 'skill', 'skill', 'skill', 'head', 'arm', 'body', 'leg']

const classText = computed(() => {
  const result: string[] = ['small']
  if (props.maneuver.lost) {
    result.push('status-lost')
  } else if (props.maneuver.used) {
    result.push('status-used')
  } else {
    result.push('status-normal')
  }

  const shozokuClass = shozokuClassMap.find(sc => props.maneuver.shozoku.includes(sc.text))?.class
  result.push(shozokuClass ? `shozoku-${shozokuClass}` : '')

  const positionClass = partClassMap[props.maneuver.parts]
  result.push(positionClass ? `part-${positionClass}` : '')

  if (shozokuClass === 'basic') {
    const basicPartsClass = basicPartsClassMap.find(b => b.text === props.maneuver.name)?.class || ''
    result.push(basicPartsClass ? `basic-${basicPartsClass}` : '')
  }

  result.push(`type${props.maneuver.type}`)

  return result.join(' ')
})
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>

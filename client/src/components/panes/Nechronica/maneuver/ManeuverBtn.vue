<template>
  <v-sheet class="px-0 d-flex flex-column" :class="battleTargetClass.at(isBattleTarget) || ''">
    <icon-btn
      :class="classText"
      :size="size"
      :text="text"
      :under-text="underText"
      :disable-button="disableButton || (maneuver.isUnknown && Boolean(perspective))"
      :activate-props="activateProps || {}"
    />
  </v-sheet>
</template>

<script setup lang="ts">
import IconBtn from '@/components/panes/Nechronica/maneuver/IconBtn.vue'
import mapping from '@/components/panes/Nechronica/mapping.json'
import { Nechronica, NechronicaManeuver, NechronicaType } from '@/components/panes/Nechronica/nechronica'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  maneuver: NechronicaManeuver
  type: NechronicaType | undefined
  character: Nechronica | undefined
  disableButton?: boolean
  activateProps?: any
  size: 'x-small' | 'small' | 'normal'
  mode: 'normal' | 'simple' | 'icon'
  viewLabel?: keyof NechronicaManeuver | ''
  battleTiming?: string
  perspective: string
}>()

const { t } = useI18n()

const battleTargetClass = ['bg-transparent', 'bg-cyan-lighten-4', 'bg-yellow-accent-2']

const text = computed(() => {
  if (props.mode !== 'normal') return ''
  if (props.perspective && props.maneuver.isUnknown) return '???'
  return props.maneuver.name
})

const underText = computed(() => {
  if (!props.viewLabel) return ''
  if (props.perspective && props.maneuver.isUnknown) return '???'

  const value = props.maneuver[props.viewLabel]
  if (props.viewLabel === 'timing') {
    return t(mapping.MANEUVER_TIMING[value as number].text)
  }
  return value?.toString() || ''
})

const isBattleTarget = computed((): number => {
  // 行動値増加カテゴリのマニューバはこの用途で目立たせる意味がないので背景色をつけない
  if (props.maneuver.type === 3) return 0
  if (!props.battleTiming) return 0
  if (props.maneuver.isUnknown) return 0

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

const partClassMap = [
  '',
  'maneuver-skill',
  'maneuver-skill',
  'maneuver-skill',
  'maneuver-head',
  'maneuver-arm',
  'maneuver-body',
  'maneuver-leg'
]

function getSkillManeuverText(): string {
  const basic = props.character?.basic
  if (!basic) return ''
  switch (props.maneuver.parts) {
    case 1:
      return mapping.CHARACTER_POSITION[basic.position]?.text || ''
    case 2:
      return mapping.CHARACTER_CLASS[basic.mainClass]?.text || ''
    case 3:
      return mapping.CHARACTER_CLASS[basic.subClass]?.text || ''
    default:
  }
  return ''
}

const classText = computed(() => {
  const result: string[] = []

  const partsClass = partClassMap[props.maneuver.parts] || ''
  if (partsClass) {
    result.push(partsClass)
  }

  let basicClass = mapping.BASIC_PARTS_ICON_CLASS_MAP.find(b => b.text === props.maneuver.name)?.class || ''
  basicClass ||= mapping.BASIC_PARTS_ICON_CLASS_MAP.find(b => b.text === props.maneuver.shozoku)?.class || ''
  if (basicClass) {
    result.push(basicClass)
  } else {
    const pushIncludesClass = (text: string): boolean => {
      const shozokuClass = mapping.ICON_CLASS_MAP.find(sc => text.includes(sc.text))?.class || ''
      if (!shozokuClass) return false
      result.push(shozokuClass)
      return true
    }
    if (!pushIncludesClass(props.maneuver.shozoku)) {
      pushIncludesClass(getSkillManeuverText())
    }
  }

  if (!result.length) {
    result.push(['doll', 'savant'].includes(props.type || '') ? 'error' : 'maneuver-skill')
  }

  if (props.mode !== 'simple') {
    result.push(`type${props.maneuver.type}`)
  }

  if (props.maneuver.isUnknown) {
    result.splice(0, result.length, 'unknown', 'type0')
  }

  if (props.mode === 'normal') {
    if (props.maneuver.lost) {
      result.push('lost')
    } else if (props.maneuver.used) {
      result.push('used')
    }
  }

  return result.join(' ')
})
</script>

<style lang="scss" scoped>
.maneuver-label {
  line-height: 1em;
  font-size: 11px;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 52px;
  font-family: 'M PLUS Rounded 1c', sans-serif !important;
}
</style>

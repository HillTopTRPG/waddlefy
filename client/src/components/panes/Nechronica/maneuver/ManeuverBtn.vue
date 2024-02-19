<template>
  <v-sheet class="px-0 d-flex flex-column" :class="battleTargetClass.at(isBattleTarget) || ''">
    <icon-btn
      :class="classText"
      :size="size"
      :text="mode === 'normal' ? maneuver.name : ''"
      :under-text="text"
      :disable-button="disableButton"
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
}>()

const { t } = useI18n()

const battleTargetClass = ['bg-transparent', 'bg-cyan-lighten-4', 'bg-yellow-accent-2']
const text = computed(() => {
  if (!props.viewLabel) return ''
  const value = props.maneuver[props.viewLabel]
  if (props.viewLabel === 'timing') {
    return t(mapping.MANEUVER_TIMING[value as number].text)
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

const partClassMap = ['', 'skill', 'skill', 'skill', 'head', 'arm', 'body', 'leg']

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
    const shozokuText = props.maneuver.shozoku || getSkillManeuverText()
    const shozokuClass = mapping.ICON_CLASS_MAP.find(sc => shozokuText.includes(sc.text))?.class || ''
    if (shozokuClass) {
      result.push(shozokuClass)
    }
  }
  if (!result.length) {
    result.push(['doll', 'savant'].includes(props.type || '') ? 'unknown' : 'skill')
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

  return result.join(' ')
})
</script>

<!--suppress HtmlUnknownAttribute -->
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

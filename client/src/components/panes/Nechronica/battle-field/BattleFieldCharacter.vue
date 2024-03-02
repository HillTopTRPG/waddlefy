<template>
  <v-sheet
    class="battle-field-character d-flex flex-column align-center bg-transparent"
    :class="selected ? 'selected' : ''"
    @click="emits('click')"
  >
    <span class="ellipsis text-caption bg-transparent w-100">{{ character.data.character.basic.characterName }}</span>
    <v-badge
      :model-value="Boolean(badgeContent)"
      color="black"
      bordered
      location="bottom right"
      :floating="true"
      class="position-relative"
      :content="badgeContent || ''"
    >
      <icon-btn :class="icon" size="normal" color="white" :disable-button="true" />
    </v-badge>
  </v-sheet>
</template>

<script setup lang="ts">
import IconBtn from '@/components/panes/Nechronica/maneuver/IconBtn.vue'
import mapping from '@/components/panes/Nechronica/mapping.json'
import { NechronicaWrap } from '@/components/panes/Nechronica/nechronica'
import { computed } from 'vue'

const props = defineProps<{
  character: { id: string; data: NechronicaWrap }
  selected: boolean
  perspective: string
}>()

const emits = defineEmits<{
  (e: 'click'): Promise<void>
}>()

const icon = computed(() => {
  if (props.character.data.type === 'doll') {
    return mapping.CHARACTER_POSITION[props.character.data.character.basic.position].val
  }
  return `type-${props.character.data.type}`
})

const badgeContent = computed(() => {
  if (['savant', 'horror'].includes(props.character.data.type)) {
    return props.character.data.character.maneuverList.filter(m => !m.lost).length.toString()
  }
  if (props.character.data.type === 'legion') {
    return props.character.data.health.toString()
  }
  return null
})
</script>

<style lang="scss" scoped>
.battle-field-character {
  width: 70px;
  padding-bottom: 2px;
  cursor: pointer;
  box-sizing: border-box;
  border: transparent 2px solid;
}

.selected {
  border: yellow 2px solid;
  outline: darkblue 3px solid;
}

:deep(.v-badge__badge) {
  z-index: 100;
  transform: translate(-1.8em, -1.3em);
  font-size: 1.1em;
  height: 1.5em;
  min-width: 2em;
}
</style>

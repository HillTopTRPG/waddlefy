<template>
  <v-sheet class="px-0 d-inline-flex flex-column bg-transparent">
    <span v-if="text" class="maneuver-label text-left" :class="size">{{ text }}</span>
    <v-btn
      class="maneuver"
      variant="flat"
      rounded="pill"
      density="comfortable"
      :class="classWrap"
      :style="`pointer-events: ${disableButton ? 'none' : 'auto'};`"
      v-bind="activateProps || {}"
    />
    <span v-if="underText" class="maneuver-label text-center" :class="size">{{ underText }}</span>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  activateProps?: any
  disableButton?: boolean
  text?: string
  size: 'x-small' | 'small' | 'normal'
  underText?: string
  class: string
}>()

const classWrap = computed(() => `${props.class} ${props.size}`)
</script>

<style lang="scss" scoped>
.maneuver-label {
  line-height: 1em;
  font-size: 11px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-family: 'M PLUS Rounded 1c', sans-serif !important;

  &.normal {
    max-width: 64px;
  }
  &.small {
    max-width: 52px;
  }
  &.x-small {
    max-width: 32px;
  }
}

.maneuver {
  box-sizing: border-box;
  padding: 0 !important;
  overflow-y: visible;
  display: inline-flex !important;
  align-items: center;
  justify-content: flex-start;
  text-transform: none;

  @mixin absoluteFullSize {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }

  @mixin imageCanvas {
    background-color: transparent;
    background-size: contain !important;
    background-origin: content-box !important;
    background-repeat: no-repeat !important;
  }

  @include imageCanvas;

  &:before,
  &:after,
  :deep(.v-btn__content):before,
  :deep(.v-btn__content):after {
    content: '';
    @include absoluteFullSize;
    @include imageCanvas;
  }

  @mixin fixedSize($width) {
    width: $width !important;
    min-width: $width !important;
    height: $width !important;
    min-height: $width !important;
  }

  @mixin allFixedSize($width) {
    @include fixedSize($width);

    :deep(.v-btn__content) {
      @include fixedSize($width);
    }
    :deep(.v-btn__underlay) {
      @include fixedSize($width);
    }
  }

  &:not(.small):not(.x-small) {
    $width: 64px;
    @include allFixedSize($width);
  }

  &.small {
    $width: 52px;
    @include allFixedSize($width);
  }

  &.x-small {
    $width: 32px;
    @include allFixedSize($width);
  }

  :deep(.v-btn__content) {
    @include absoluteFullSize;
    @include imageCanvas;
    z-index: 3;
    opacity: 1;
  }

  :deep(.v-btn__underlay) {
    position: relative;
    width: 100%;
    height: 100%;
    z-index: 2;
  }

  @mixin maneuverBackFrame($url) {
    &:deep(.v-btn__content) {
      background-image: $url;
    }
  }

  @mixin statusImage($url) {
    &:deep(.v-btn__content):after {
      background-image: $url;
    }
  }

  @mixin iconImage($url) {
    &:deep(.v-btn__content):before {
      background-image: $url;
    }
  }

  &.type0 {
    @include maneuverBackFrame(url(/nechronica/maneuver-back/0.png));
  }

  &.type1 {
    @include maneuverBackFrame(url(/nechronica/maneuver-back/1.png));
  }

  &.type2 {
    @include maneuverBackFrame(url(/nechronica/maneuver-back/2.png));
  }

  &.type3 {
    @include maneuverBackFrame(url(/nechronica/maneuver-back/3.png));
  }

  &.type4 {
    @include maneuverBackFrame(url(/nechronica/maneuver-back/4.png));
  }

  &.type5 {
    @include maneuverBackFrame(url(/nechronica/maneuver-back/5.png));
  }

  &.type6 {
    @include maneuverBackFrame(url(/nechronica/maneuver-back/6.png));
  }

  &.type7 {
    @include maneuverBackFrame(url(/nechronica/maneuver-back/7.png));
  }

  &.lost {
    @include statusImage(url(/nechronica/mark/lost.png));
  }

  &.used {
    @include statusImage(url(/nechronica/mark/used.png));
  }

  &.parts-skill {
    @include iconImage(url(/nechronica/parts/skill.png));
  }

  &.maneuver-skill {
    @include iconImage(url(/nechronica/maneuver/skill.png));
  }

  &.parts-head {
    @include iconImage(url(/nechronica/parts/head.png));
  }

  &.maneuver-head {
    @include iconImage(url(/nechronica/maneuver/head.png));
  }

  &.parts-arm {
    @include iconImage(url(/nechronica/parts/arm.png));
  }

  &.maneuver-arm {
    @include iconImage(url(/nechronica/maneuver/arm.png));
  }

  &.parts-body {
    @include iconImage(url(/nechronica/parts/body.png));
  }

  &.maneuver-body {
    @include iconImage(url(/nechronica/maneuver/body.png));
  }

  &.parts-leg {
    @include iconImage(url(/nechronica/parts/leg.png));
  }

  &.maneuver-leg {
    @include iconImage(url(/nechronica/maneuver/leg.png));
  }

  &.unknown {
    @include iconImage(url(/nechronica/unknown.png));
  }

  &.maneuver-armed {
    @include iconImage(url(/nechronica/maneuver/armed.png));
  }

  &.maneuver-mutation {
    @include iconImage(url(/nechronica/maneuver/mutation.png));
  }

  &.maneuver-modification {
    @include iconImage(url(/nechronica/maneuver/modification.png));
  }

  &.position-alice {
    @include iconImage(url(/nechronica/position/alice.png));
  }

  &.position-holic {
    @include iconImage(url(/nechronica/position/holic.png));
  }

  &.position-automaton {
    @include iconImage(url(/nechronica/position/automaton.png));
  }

  &.position-junk {
    @include iconImage(url(/nechronica/position/junk.png));
  }

  &.position-court {
    @include iconImage(url(/nechronica/position/court.png));
  }

  &.position-sorority {
    @include iconImage(url(/nechronica/position/sorority.png));
  }

  &.class-psychedelic {
    @include iconImage(url(/nechronica/class/psychedelic.png));
  }

  &.class-stacy {
    @include iconImage(url(/nechronica/class/stacy.png));
  }

  &.class-thanatos {
    @include iconImage(url(/nechronica/class/thanatos.png));
  }

  &.class-gothic {
    @include iconImage(url(/nechronica/class/gothic.png));
  }

  &.class-requiem {
    @include iconImage(url(/nechronica/class/requiem.png));
  }

  &.class-baroque {
    @include iconImage(url(/nechronica/class/baroque.png));
  }

  &.class-romanesque {
    @include iconImage(url(/nechronica/class/romanesque.png));
  }

  &.maneuver-treasure {
    @include iconImage(url(/nechronica/maneuver/treasure.png));
  }

  &.type-legion {
    @include iconImage(url(/nechronica/type/legion.png));
  }

  &.type-horror {
    @include iconImage(url(/nechronica/type/horror.png));
  }

  &.type-savant {
    @include iconImage(url(/nechronica/type/savant.png));
  }

  &.basic-brain {
    @include iconImage(url(/nechronica/maneuver-base/brain.png));
  }

  &.basic-eye {
    @include iconImage(url(/nechronica/maneuver-base/eye.png));
  }

  &.basic-jaw {
    @include iconImage(url(/nechronica/maneuver-base/jaw.png));
  }

  &.basic-fist {
    @include iconImage(url(/nechronica/maneuver-base/fist.png));
  }

  &.basic-arm {
    @include iconImage(url(/nechronica/maneuver-base/arm.png));
  }

  &.basic-shoulder {
    @include iconImage(url(/nechronica/maneuver-base/shoulder.png));
  }

  &.basic-spine {
    @include iconImage(url(/nechronica/maneuver-base/spine.png));
  }

  &.basic-viscera {
    @include iconImage(url(/nechronica/maneuver-base/viscera.png));
  }

  &.basic-bone {
    @include iconImage(url(/nechronica/maneuver-base/bone.png));
  }

  &.basic-leg {
    @include iconImage(url(/nechronica/maneuver-base/leg.png));
  }

  &.error {
    @include iconImage(url(/nechronica/error.png));
  }
}
</style>

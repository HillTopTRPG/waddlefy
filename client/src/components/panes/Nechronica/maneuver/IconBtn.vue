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

<!--suppress HtmlUnknownAttribute -->
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
    @include maneuverBackFrame(url('/nechronica/maneuver-back-type-00.png'));
  }

  &.type1 {
    @include maneuverBackFrame(url('/nechronica/maneuver-back-type-01.png'));
  }

  &.type2 {
    @include maneuverBackFrame(url('/nechronica/maneuver-back-type-02.png'));
  }

  &.type3 {
    @include maneuverBackFrame(url('/nechronica/maneuver-back-type-03.png'));
  }

  &.type4 {
    @include maneuverBackFrame(url('/nechronica/maneuver-back-type-04.png'));
  }

  &.type5 {
    @include maneuverBackFrame(url('/nechronica/maneuver-back-type-05.png'));
  }

  &.type6 {
    @include maneuverBackFrame(url('/nechronica/maneuver-back-type-06.png'));
  }

  &.type7 {
    @include maneuverBackFrame(url('/nechronica/maneuver-back-type-07.png'));
  }

  &.lost {
    @include statusImage(url(/nechronica/lost.png));
  }

  &.used {
    @include statusImage(url(/nechronica/used.png));
  }

  &.skill {
    @include iconImage(url(/nechronica/skill.png));
  }

  &.head {
    @include iconImage(url(/nechronica/head.png));
  }

  &.arm {
    @include iconImage(url(/nechronica/arm.png));
  }

  &.body {
    @include iconImage(url(/nechronica/body.png));
  }

  &.leg {
    @include iconImage(url(/nechronica/leg.png));
  }

  &.armed {
    @include iconImage(url(/nechronica/skill.png));
  }

  &.mutation {
    @include iconImage(url(/nechronica/skill.png));
  }

  &.modification {
    @include iconImage(url(/nechronica/skill.png));
  }

  &.alice {
    @include iconImage(url(/nechronica/skill.png));
  }

  &.holic {
    @include iconImage(url(/nechronica/skill.png));
  }

  &.automaton {
    @include iconImage(url(/nechronica/skill.png));
  }

  &.junk {
    @include iconImage(url(/nechronica/skill.png));
  }

  &.coat {
    @include iconImage(url(/nechronica/skill.png));
  }

  &.sorority {
    @include iconImage(url(/nechronica/skill.png));
  }

  &.psychedelic {
    @include iconImage(url(/nechronica/skill.png));
  }

  &.stacy {
    @include iconImage(url(/nechronica/requiem.png));
  }

  &.thanatos {
    @include iconImage(url(/nechronica/requiem.png));
  }

  &.gothic {
    @include iconImage(url(/nechronica/requiem.png));
  }

  &.requiem {
    @include iconImage(url(/nechronica/requiem.png));
  }

  &.baroque {
    @include iconImage(url(/nechronica/requiem.png));
  }

  &.romanesque {
    @include iconImage(url(/nechronica/requiem.png));
  }

  &.treasure {
    @include iconImage(url(/nechronica/treasure.png));
  }

  &.legion {
    @include iconImage(url(/nechronica/requiem.png));
  }

  &.horror {
    @include iconImage(url(/nechronica/requiem.png));
  }

  &.savant {
    @include iconImage(url(/nechronica/requiem.png));
  }

  &.basic-brain {
    @include iconImage(url(/nechronica/head.png));
  }

  &.basic-eye {
    @include iconImage(url(/nechronica/head.png));
  }

  &.basic-jaw {
    @include iconImage(url(/nechronica/head.png));
  }

  &.basic-fist {
    @include iconImage(url(/nechronica/arm.png));
  }

  &.basic-arm {
    @include iconImage(url(/nechronica/arm.png));
  }

  &.basic-shoulder {
    @include iconImage(url(/nechronica/arm.png));
  }

  &.basic-backbone {
    @include iconImage(url(/nechronica/body.png));
  }

  &.basic-viscera {
    @include iconImage(url(/nechronica/body.png));
  }

  &.basic-bone {
    @include iconImage(url(/nechronica/leg.png));
  }

  &.basic-leg {
    @include iconImage(url(/nechronica/leg.png));
  }
}
</style>

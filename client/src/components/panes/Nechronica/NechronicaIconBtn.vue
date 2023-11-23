<template>
  <v-btn
    class="maneuver"
    variant="flat"
    rounded="pill"
    density="comfortable"
    :class="`${text ? 'mt-3 text' : ''} ${underText ? 'mb-3' : ''}`"
    :ripple="!disableButton"
    :style="`cursor: ${disableButton ? 'auto' : 'cursor'}; ${underText ? '--under-text: \'' + underText + '\';' : ''}`"
    v-bind="activateProps || {}"
    :text="text || ''"
  />
</template>

<script setup lang="ts">
// eslint-disable-next-line unused-imports/no-unused-vars
defineProps<{
  activateProps?: any
  disableButton?: boolean
  text?: string
  underText?: string
}>()
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.menu-select {
  flex-grow: 0;

  :deep(.v-field__append-inner) {
    display: none;
  }
  :deep(.v-field__prepend-inner) .v-icon {
    opacity: 1 !important;
    text-align: right;
    font-size: 18px;
    margin-top: 4px;
  }
  :deep(.v-field__prepend-inner),
  :deep(.v-text-field__prefix),
  :deep(.v-field__input) {
    padding-top: 0;
    padding-left: 0;
    margin-top: 2px;
    color: black;
    font-size: 14px;
    min-height: auto;
  }
}

.maneuver {
  box-sizing: border-box;
  padding: 0 !important;
  background-size: 100% auto !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
  background-color: transparent;
  overflow-y: visible;
  display: inline-flex !important;
  align-items: center;
  justify-content: flex-start;

  &:before {
    content: '';
    position: absolute;
    opacity: 1;
    background-origin: content-box !important;
    background-position: center;
    background-size: contain !important;
  }

  :deep(.v-btn__content) {
    height: auto;
    white-space: nowrap;
    line-height: 1em;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    font-size: 11px;
    text-align: left;
  }

  :deep(.v-btn__underlay):after {
    content: var(--under-text);
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    opacity: 1;
    line-height: 1em;
    font-size: 11px;
    transform: translateY(100%);
    text-align: center;
    overflow-x: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &:not(.small) {
    width: 64px !important;
    height: 64px !important;
    min-width: 64px !important;
    min-height: 64px !important;

    :deep(.v-btn__content) {
      width: 64px !important;
      min-width: 64px !important;
      max-width: 64px !important;
    }

    &.text :deep(.v-btn__content) {
      transform: translateY(calc(-64px / 2 - 6px));
    }

    &:before {
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    }
  }

  &.small {
    width: 52px !important;
    min-width: 52px !important;
    height: 52px !important;
    min-height: 52px !important;

    :deep(.v-btn__content) {
      width: 52px !important;
      min-width: 52px !important;
      max-width: 52px !important;
    }

    &.text :deep(.v-btn__content) {
      transform: translateY(calc(-52px / 2 - 6px));
    }

    &:before {
      top: 1px;
      bottom: 1px;
      left: 1px;
      right: 1px;
    }
  }

  &.type1 {
    background-color: rgb(0, 128, 1);
  }

  &.type2 {
    background-color: rgb(139, 0, 0);
  }

  &.type3 {
    background-color: rgb(217, 150, 38);
  }

  &.type4 {
    background-color: rgb(128, 128, 255);
  }

  &.type5 {
    background-color: rgb(255, 128, 128);
  }

  &.type6 {
    background-color: rgb(191, 128, 255);
  }

  &.type7 {
    background-color: rgb(223, 223, 128);
  }

  &.part-skill {
    &.maneuver-header:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
    &.status-normal:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
    &.status-used:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
    &.status-lost:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
  }

  &.part-head {
    &.maneuver-header:before {
      background-image: url(/nechronica/maneuver-head-normal.png);
    }
    &.status-normal:before {
      background-image: url(/nechronica/maneuver-head-normal.png);
    }
    &.status-used:before {
      background-image: url(/nechronica/maneuver-head-normal.png);
    }
    &.status-lost:before {
      background-image: url(/nechronica/maneuver-head-normal.png);
    }
  }

  &.part-arm {
    &.maneuver-header:before {
      background-image: url(/nechronica/maneuver-arm-normal.png);
    }
    &.status-normal:before {
      background-image: url(/nechronica/maneuver-arm-normal.png);
    }
    &.status-used:before {
      background-image: url(/nechronica/maneuver-arm-normal.png);
    }
    &.status-lost:before {
      background-image: url(/nechronica/maneuver-arm-normal.png);
    }
  }

  &.part-body {
    &.maneuver-header:before {
      background-image: url(/nechronica/maneuver-body-normal.png);
    }
    &.status-normal:before {
      background-image: url(/nechronica/maneuver-body-normal.png);
    }
    &.status-used:before {
      background-image: url(/nechronica/maneuver-body-normal.png);
    }
    &.status-lost:before {
      background-image: url(/nechronica/maneuver-body-normal.png);
    }
  }

  &.part-leg {
    &.maneuver-header:before {
      background-image: url(/nechronica/maneuver-leg-normal.png);
    }
    &.status-normal:before {
      background-image: url(/nechronica/maneuver-leg-normal.png);
    }
    &.status-used:before {
      background-image: url(/nechronica/maneuver-leg-normal.png);
    }
    &.status-lost:before {
      background-image: url(/nechronica/maneuver-leg-normal.png);
    }
  }

  &.shozoku-armed {
    &.status-normal:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
    &.status-used:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
    &.status-lost:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
  }

  &.shozoku-mutation {
    &.status-normal:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
    &.status-used:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
    &.status-lost:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
  }

  &.shozoku-modification {
    &.status-normal:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
    &.status-used:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
    &.status-lost:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
  }

  &.alice:before {
    background-image: url(/nechronica/maneuver-skill-normal.png);
  }

  &.shozoku-alice {
    &.status-normal:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
    &.status-used:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
    &.status-lost:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
  }

  &.holic:before {
    background-image: url(/nechronica/maneuver-skill-normal.png);
  }

  &.shozoku-holic {
    &.status-normal:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
    &.status-used:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
    &.status-lost:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
  }

  &.automaton:before {
    background-image: url(/nechronica/maneuver-skill-normal.png);
  }

  &.shozoku-automaton {
    &.status-normal:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
    &.status-used:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
    &.status-lost:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
  }

  &.junk:before {
    background-image: url(/nechronica/maneuver-skill-normal.png);
  }

  &.shozoku-junk {
    &.status-normal:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
    &.status-used:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
    &.status-lost:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
  }

  &.coat:before {
    background-image: url(/nechronica/maneuver-skill-normal.png);
  }

  &.shozoku-coat {
    &.status-normal:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
    &.status-used:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
    &.status-lost:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
  }

  &.sorority:before {
    background-image: url(/nechronica/maneuver-skill-normal.png);
  }

  &.shozoku-sorority {
    &.status-normal:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
    &.status-used:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
    &.status-lost:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
  }

  &.psychedelic:before {
    background-image: url(/nechronica/maneuver-skill-normal.png);
  }

  &.shozoku-psychedelic {
    &.status-normal:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
    &.status-used:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
    &.status-lost:before {
      background-image: url(/nechronica/maneuver-skill-normal.png);
    }
  }

  &.stacy:before {
    background-image: url(/nechronica/maneuver-skill-normal.png);
  }

  &.thanatos:before {
    background-image: url(/nechronica/maneuver-skill-normal.png);
  }

  &.gothic:before {
    background-image: url(/nechronica/maneuver-skill-normal.png);
  }

  &.requiem:before {
    background-image: url(/nechronica/maneuver-skill-normal.png);
  }

  &.baroque:before {
    background-image: url(/nechronica/maneuver-skill-normal.png);
  }

  &.romanesque:before {
    background-image: url(/nechronica/maneuver-skill-normal.png);
  }

  &.shozoku-treasure {
    &.status-normal:before {
      background-image: url(/nechronica/maneuver-treasure-normal.png);
    }
    &.status-used:before {
      background-image: url(/nechronica/maneuver-treasure-normal.png);
    }
    &.status-lost:before {
      background-image: url(/nechronica/maneuver-treasure-normal.png);
    }
  }

  &.basic-brain {
    &.status-normal:before {
      background-image: url(/nechronica/maneuver-head-normal.png);
    }
    &.status-used:before {
      background-image: url(/nechronica/maneuver-head-normal.png);
    }
    &.status-lost:before {
      background-image: url(/nechronica/maneuver-head-normal.png);
    }
  }

  &.basic-eye {
    &.status-normal:before {
      background-image: url(/nechronica/maneuver-head-normal.png);
    }
    &.status-used:before {
      background-image: url(/nechronica/maneuver-head-normal.png);
    }
    &.status-lost:before {
      background-image: url(/nechronica/maneuver-head-normal.png);
    }
  }

  &.basic-jaw {
    &.status-normal:before {
      background-image: url(/nechronica/maneuver-head-normal.png);
    }
    &.status-used:before {
      background-image: url(/nechronica/maneuver-head-normal.png);
    }
    &.status-lost:before {
      background-image: url(/nechronica/maneuver-head-normal.png);
    }
  }

  &.basic-fist {
    &.status-normal:before {
      background-image: url(/nechronica/maneuver-arm-normal.png);
    }
    &.status-used:before {
      background-image: url(/nechronica/maneuver-arm-normal.png);
    }
    &.status-lost:before {
      background-image: url(/nechronica/maneuver-arm-normal.png);
    }
  }

  &.basic-arm {
    &.status-normal:before {
      background-image: url(/nechronica/maneuver-arm-normal.png);
    }
    &.status-used:before {
      background-image: url(/nechronica/maneuver-arm-normal.png);
    }
    &.status-lost:before {
      background-image: url(/nechronica/maneuver-arm-normal.png);
    }
  }

  &.basic-shoulder {
    &.status-normal:before {
      background-image: url(/nechronica/maneuver-arm-normal.png);
    }
    &.status-used:before {
      background-image: url(/nechronica/maneuver-arm-normal.png);
    }
    &.status-lost:before {
      background-image: url(/nechronica/maneuver-arm-normal.png);
    }
  }

  &.basic-backbone {
    &.status-normal:before {
      background-image: url(/nechronica/maneuver-body-normal.png);
    }
    &.status-used:before {
      background-image: url(/nechronica/maneuver-body-normal.png);
    }
    &.status-lost:before {
      background-image: url(/nechronica/maneuver-body-normal.png);
    }
  }

  &.basic-viscera {
    &.status-normal:before {
      background-image: url(/nechronica/maneuver-body-normal.png);
    }
    &.status-used:before {
      background-image: url(/nechronica/maneuver-body-normal.png);
    }
    &.status-lost:before {
      background-image: url(/nechronica/maneuver-body-normal.png);
    }
  }

  &.basic-bone {
    &.status-normal:before {
      background-image: url(/nechronica/maneuver-leg-normal.png);
    }
    &.status-used:before {
      background-image: url(/nechronica/maneuver-leg-normal.png);
    }
    &.status-lost:before {
      background-image: url(/nechronica/maneuver-leg-normal.png);
    }
  }

  &.basic-leg {
    &.status-normal:before {
      background-image: url(/nechronica/maneuver-leg-normal.png);
    }
    &.status-used:before {
      background-image: url(/nechronica/maneuver-leg-normal.png);
    }
    &.status-lost:before {
      background-image: url(/nechronica/maneuver-leg-normal.png);
    }
  }
}
</style>

<template>
  <v-sheet class="d-flex flex-row flex-wrap px-2 pb-1" style="gap: 0.3rem 0.5rem">
    <template v-for="(_, idx) in unDraggableStackList" :key="idx">
      <maneuver-stack :index="idx" :dataList="unDraggableStackList" />
    </template>
    <draggable
      :list="draggableStackList"
      group="people"
      :component-data="{ name: 'fade' }"
      style="display: contents"
      ghost-class="ghost"
      handle=".drag-thumb"
      :animation="200"
      item-key="id"
    >
      <template #item="{ index }">
        <maneuver-stack
          :index="index"
          :dataList="draggableStackList"
          @resolve="onResolveStack(unDraggableStackList.length + index)"
          @cancel="idx => onCancelStack(idx + unDraggableStackList.length)"
        />
      </template>
    </draggable>
  </v-sheet>
</template>

<script setup lang="ts">
import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import ManeuverStack from '@/components/panes/Nechronica/maneuver-stack/ManeuverStack.vue'
import { NechronicaManeuverStack, NechronicaSingleton } from '@/components/panes/Nechronica/nechronica'
import { clone } from '@/components/panes/PrimaryDataUtility'
import { omit } from 'lodash'
import { computed, inject, ref, watch } from 'vue'
import draggable from 'vuedraggable'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const singleton = computed(
  (): { id: string; data: NechronicaSingleton } | undefined =>
    graphQlStore?.state.sessionDataList.find(sd => sd.type === 'singleton')
)

function createDraggableStackWrap(draggable: boolean): (NechronicaManeuverStack & { id: string })[] {
  return (
    singleton.value?.data.maneuverStack
      ?.map((ms: NechronicaManeuverStack, idx: number) => {
        return { id: `${ms.characterId}-${ms.maneuverIndex}-${idx}`, ...ms }
      })
      .filter(d => draggable === (d.status !== 'resolved')) || []
  )
}

const startIndex = computed(() => singleton.value?.data.maneuverStack?.findIndex(ms => !ms.status) || 0)
const draggableStackList = ref(createDraggableStackWrap(true))
const unDraggableStackList = ref(createDraggableStackWrap(false))
watch(
  () => singleton.value?.data.maneuverStack,
  () => {
    draggableStackList.value = createDraggableStackWrap(true)
    unDraggableStackList.value = createDraggableStackWrap(false)
  },
  { deep: true }
)
const allStackWrap = computed(() => {
  return [...unDraggableStackList.value, ...draggableStackList.value]
})
watch(
  allStackWrap,
  async () => {
    const after = allStackWrap.value.map(v => omit(v, 'id'))
    if (JSON.stringify(singleton.value?.data.maneuverStack) === JSON.stringify(after)) return
    await graphQlStore?.updateSingletonHelper<NechronicaSingleton>(d => {
      const result: NechronicaSingleton = {
        ...d,
        maneuverStack: allStackWrap.value.map(v => omit(v, 'id'))
      }
      return result
    })
  },
  { deep: true }
)

async function onResolveStack(index: number) {
  const cloned = clone<NechronicaManeuverStack[]>(allStackWrap.value.map(ms => omit(ms, 'id')))!
  new Array(index - startIndex.value + 1)
    .fill(null)
    .map((_, idx) => idx)
    .forEach(idx => {
      const ms = cloned[startIndex.value + idx]
      ms.status = 'resolved'
      ms.start = startIndex.value
      ms.end = index
    })
  await graphQlStore?.updateSingletonHelper<NechronicaSingleton>(d => {
    const result: NechronicaSingleton = {
      ...d,
      maneuverStack: cloned
    }
    return result
  })
}

async function onCancelStack(index: number) {
  const maneuverStackList = singleton.value?.data.maneuverStack
  if (!maneuverStackList || maneuverStackList.length <= index) return
  const ms: NechronicaManeuverStack = maneuverStackList[index]
  if (ms.type === 'use') {
    await graphQlStore?.updateNechronicaCharacterHelper(ms.characterId, c => {
      c.character.maneuverList[ms.maneuverIndex].used = false
      c.actionValue += ms.cost
    })
  } else {
    await graphQlStore?.updateNechronicaCharacterHelper(ms.characterId, c => {
      c.character.maneuverList[ms.maneuverIndex].lost = false
    })
  }
  await graphQlStore?.updateSingletonHelper(d => {
    const maneuverStack = clone(singleton.value?.data.maneuverStack || [])!
    maneuverStack.splice(index, 1)
    const result: NechronicaSingleton = {
      ...d,
      maneuverStack
    }
    return result
  })
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.ghost {
  opacity: 0.5;
}
</style>

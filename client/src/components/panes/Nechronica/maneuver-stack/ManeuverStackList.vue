<template>
  <draggable
    :list="maneuverStackWrap"
    group="people"
    :component-data="{ name: 'fade' }"
    class="d-flex flex-row flex-wrap px-2 pb-1"
    style="gap: 0.3rem 0.5rem"
    ghost-class="ghost"
    handle=".drag-thumb"
    :animation="200"
    item-key="id"
  >
    <template #item="{ index }">
      <maneuver-stack
        :dataList="maneuverStackWrap.slice(0, index + 1).reverse()"
        :view-thumb="maneuverStackWrap.length > 1"
        @delete="onDeleteStack(index)"
      />
    </template>
  </draggable>
</template>

<script setup lang="ts">
// eslint-disable-next-line unused-imports/no-unused-vars
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

function createManeuverStackWrap(): (NechronicaManeuverStack & { id: string })[] {
  return (
    singleton.value?.data.maneuverStack?.map((ms: NechronicaManeuverStack, idx: number) => {
      return { id: `${ms.characterId}-${ms.maneuverIndex}-${idx}`, ...ms }
    }) || []
  )
}

const maneuverStackWrap = ref(createManeuverStackWrap())
watch(
  () => singleton.value?.data.maneuverStack,
  () => {
    const after = createManeuverStackWrap()
    if (JSON.stringify(maneuverStackWrap.value) === JSON.stringify(after)) return
    maneuverStackWrap.value = after
  },
  { deep: true }
)
watch(
  maneuverStackWrap,
  async () => {
    const after = maneuverStackWrap.value.map(v => omit(v, 'id'))
    if (JSON.stringify(singleton.value?.data.maneuverStack) === JSON.stringify(after)) return
    await graphQlStore?.updateSingletonHelper<NechronicaSingleton>(d => {
      const result: NechronicaSingleton = {
        ...d,
        maneuverStack: maneuverStackWrap.value.map(v => omit(v, 'id'))
      }
      return result
    })
  },
  { deep: true }
)

async function onDeleteStack(index: number) {
  const cloned = clone<NechronicaManeuverStack[]>(maneuverStackWrap.value.map(ms => omit(ms, 'id')))!
  if (cloned.length > index) {
    cloned.splice(0, index + 1)
  } else {
    cloned.splice(0, cloned.length)
  }
  await graphQlStore?.updateSingletonHelper<NechronicaSingleton>(d => {
    const result: NechronicaSingleton = {
      ...d,
      maneuverStack: cloned
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

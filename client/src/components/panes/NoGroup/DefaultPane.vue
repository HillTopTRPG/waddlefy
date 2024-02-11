<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
//noinspection JSUnusedGlobalSymbols
export const componentInfo = {
  name: 'DefaultPane',
  label: '初期画面'
}
</script>

<script setup lang="ts">
import { Layout } from '@/components/panes'
import { componentMap } from '../index'

defineProps<{
  layout: Layout
  rootLayout: Layout
}>()

const emits = defineEmits<{
  (e: 'change-component', componentGroup: string, component: string): void
}>()
</script>

<template>
  <div class="root fill-height">
    <h3 class="mx-5 mt-5">空のペイン</h3>
    <p class="mx-5">
      ペインはツールを１つ選んで表示できます。<br />
      メニューバーの
      <v-icon icon="mdi-pencil-ruler" />
      でペイン編集モードを切り替えることでペインを追加したり、後から表示するツールを変更できます。
    </p>
    <p class="mx-5 mt-5">このペインに表示するツールを選ぶ</p>
    <v-list density="compact" class="mx-5 mb-5" open-strategy="multiple">
      <template v-for="g in componentMap" :key="g.group">
        <v-list-group v-if="g.group">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              :title="$t(`pane.${g.group}.group`)"
              @keydown.enter.stop="$event.target.click()"
            />
          </template>

          <v-list-item
            v-for="n in Object.keys(g.items)"
            :title="$t(`pane.${g.group}.${n}`)"
            :value="n"
            :key="n"
            @click="emits('change-component', g.group, n)"
            @keydown.enter.stop="$event.target.click()"
          />
        </v-list-group>
        <template v-else>
          <v-list-item
            v-for="n in Object.keys(g.items).filter(m => m !== '初期画面')"
            :title="$t(n)"
            :value="n"
            :key="n"
            @click="emits('change-component', g.group, n)"
            @keydown.enter.stop="$event.target.click()"
          />
        </template>
      </template>
    </v-list>
  </div>
</template>

<!--suppress HtmlUnknownAttribute -->
<style deep lang="css">
.v-card.chat-input-container {
  border-radius: 0;
  background: transparent !important;
}

.chat-input .v-input__control textarea,
.chat-input .v-input__control {
  height: 100%;
  width: 100%;
  position: absolute;
}
</style>

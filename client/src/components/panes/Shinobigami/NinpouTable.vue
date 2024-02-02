<template>
  <table class="ninpou-table bg-white">
    <v-defaults-provider :defaults="{ VIcon: {} }"></v-defaults-provider>
    <thead class="bg-grey-darken-4">
      <tr>
        <template v-if="mode === 'secret'">
          <th class="secret">秘</th>
        </template>
        <th>忍法名</th>
        <template v-if="mode !== 'secret'">
          <th>指定特技</th>
          <th>間</th>
          <th>ｺｽﾄ</th>
        </template>
      </tr>
    </thead>
    <tbody v-if="list">
      <tr v-for="(arts, idx) in useList" :key="idx">
        <template v-if="mode === 'secret'">
          <td class="secret">
            <v-checkbox
              :model-value="arts.secret"
              @update:model-value="v => onChangeSecret(idx, v || false)"
              density="compact"
              :hide-details="true"
            />
          </td>
        </template>
        <v-menu :close-on-content-click="false" :z-index="10000000">
          <template #activator="{ props }">
            <td class="name" v-bind="props">
              <v-icon :icon="getArtsIcon(arts)" style="width: 1.5rem" />
              {{ arts.name }}
            </td>
          </template>
          <v-card class="border arts-detail" style="max-width: 20rem">
            <v-card-title class="text-pre-wrap">{{ arts.name }}</v-card-title>
            <v-card-text class="pb-2">
              <v-label class="text-caption">効果</v-label>
              <v-sheet class="text-pre-wrap text-body-2 bg-transparent">{{ arts.effect || '未記入' }}</v-sheet>
            </v-card-text>
            <v-card-text class="pt-0">
              <v-defaults-provider :defaults="{ VChip: { variant: 'outlined', style: 'border-color: #666' } }">
                <v-chip class="px-3 mr-1" size="small">参照頁: {{ arts.page }}</v-chip>
              </v-defaults-provider>
            </v-card-text>
          </v-card>
        </v-menu>
        <template v-if="mode !== 'secret'">
          <td class="target" :class="targetClass(arts.targetSkill)" @click="onClickSkill(arts.targetSkill)">
            {{ arts.targetSkill }}
          </td>
          <td class="range">{{ arts.range }}</td>
          <td class="cost">{{ arts.cost }}</td>
        </template>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { NinjaArts, SkillTable } from '@/components/panes/Shinobigami/shinobigami'
import { computed } from 'vue'

const props = defineProps<{
  list: NinjaArts[] | undefined
  mode?: 'secret'
  selectSkill: string
  perspective: string
}>()

const emits = defineEmits<{
  (e: 'click-skill', arts: string): void
  (e: 'update-secret', index: number, value: boolean): void
}>()

const useList = computed(() => {
  if (props.mode === 'secret' || !props.perspective) {
    return props.list || []
  } else {
    return props.list?.filter(n => !n.secret) || []
  }
})

function getArtsIcon(arts: NinjaArts) {
  switch (arts.type) {
    case '攻撃':
      return 'mdi-shuriken'
    case 'サポート':
      return 'mdi-script-text mdi-rotate-90'
    case '装備':
      return 'mdi-meditation'
  }
  return ''
}

function targetClass(skill: string): string {
  const classes: string[] = []
  if (skill === props.selectSkill) {
    classes.push('selected')
  }
  if (isIncludeSkills(skill)) {
    classes.push('enable')
  }
  return classes.join(' ')
}

function onClickSkill(skill: string): void {
  if (!isIncludeSkills(skill)) return
  emits('click-skill', skill)
}

function isIncludeSkills(skill: string): boolean {
  return SkillTable.some(t => t.some(s => s === skill))
}

function onChangeSecret(idx: number, secret: boolean) {
  emits('update-secret', idx, secret)
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.ninpou-table {
  border-left: 1px solid #aaa;
  border-top: 1px solid #aaa;
  border-right: 2px solid #aaa;
  border-bottom: 2px solid #aaa;
  border-collapse: separate;
  border-spacing: 0;

  th {
    text-align: center !important;
  }

  td {
    text-align: left !important;

    &.range,
    &.cost {
      text-align: center !important;
    }
  }

  th,
  td {
    padding: 0 5px !important;
    line-height: 1em;
    height: 1.8em !important;
    font-size: 14px;
    border-left: 1px solid #aaa;
    border-top: 1px solid #aaa;
    white-space: nowrap;
    user-select: none;

    &.secret {
      width: 2.8em;
      max-width: 2.8em;
    }

    &.name {
      padding: 0 5px 0 2px !important;
      text-decoration: underline;
      cursor: pointer;
    }

    &.target.enable {
      text-decoration: underline;
      cursor: pointer;
    }

    &.selected {
      outline: red 3px solid;
      outline-offset: -1px;
    }
  }
}

.arts-detail {
  background-image: url('/white_00053.jpg') !important;

  &:before {
    content: '';
    z-index: -1;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    backdrop-filter: blur(1px);
  }
}
</style>

<template>
  <v-card class="px-2 pt-2 pb-1 bg-white border">
    <v-defaults-provider :defaults="{ VChip: { class: 'px-3 mr-1', size: 'small', variant: 'outlined' } }">
      <v-defaults-provider :defaults="{ VCardText: { class: 'pa-0' } }">
        <v-card-text class="mb-2">
          <v-chip :text="characterSheet.level" v-if="characterSheet.level" style="border-color: #666" />
          <v-chip :text="characterSheet.belief" v-if="characterSheet.belief" style="border-color: #666" />
          <v-chip :text="characterSheet.sex" v-if="characterSheet.sex" style="border-color: #666" />
          <v-chip :text="characterSheet.age" v-if="characterSheet.age" style="border-color: #666" />
          <v-chip :text="characterSheet.cover" v-if="characterSheet.cover" style="border-color: #666" />
        </v-card-text>
        <v-card-text>
          <v-chip size="large" style="border-color: #666">
            {{ characterSheet.upperStyle }}{{ characterSheet.subStyle ? ` - ${characterSheet.subStyle}` : '' }}
          </v-chip>
        </v-card-text>
        <v-card-text>
          <div class="tree">
            <ul>
              <li v-if="characterSheet.stylerule">{{ characterSheet.stylerule }}</li>
              <li v-if="characterSheet.foe">仇敵：{{ characterSheet.foe }}</li>
            </ul>
          </div>
        </v-card-text>
      </v-defaults-provider>
    </v-defaults-provider>
  </v-card>
</template>

<script setup lang="ts">
import { ShinobiGami } from '@/components/panes/Shinobigami/shinobigami'

const props = defineProps<{
  characterSheet: ShinobiGami
}>()
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.base-info {
  background-image: url('/paint_00001.jpg');
}

.tree {
  position: relative;
  font-size: 0.85rem;
  line-height: 1.5;
  margin-left: 1em;

  ul {
    padding-left: 5px;
    list-style: none;

    li {
      position: relative;
      padding-top: 5px;
      padding-bottom: 5px;
      padding-left: 15px;
      box-sizing: border-box;

      &:before {
        position: absolute;
        top: 15px;
        left: 0;
        width: 10px;
        height: 1px;
        margin: auto;
        content: '';
        background-color: #666;
      }

      &:after {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        width: 1px;
        height: 100%;
        content: '';
        background-color: #666;
      }

      &:last-child:after {
        height: 15px;
      }
    }
  }
}
</style>

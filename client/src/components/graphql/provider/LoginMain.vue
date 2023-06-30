<template>
  <template v-if="!graphQlStore?.state.userToken">
    <v-main>
      <v-container>
        <v-row justify="center">
          <v-col cols="12" sm="12" md="10" lg="8" xl="6">
            <v-timeline class="stepper" direction="horizontal" side="start" density="comfortable">
              <v-timeline-item
                icon-color="white"
                :dot-color="graphQlStore?.state.roomToken ? 'grey-lighten-1' : 'primary'"
                :line-inset="graphQlStore?.state.roomToken ? 0 : 5"
                :size="graphQlStore?.state.roomToken ? 'default' : 40"
                :fill-dot="!graphQlStore?.state.roomToken"
                :density="graphQlStore?.state.roomToken ? 'compact' : 'default'"
              >
                <template v-slot:icon>1</template>
                <div class="text-h6" style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">部屋に入る</div>
              </v-timeline-item>

              <v-timeline-item
                icon-color="white"
                :dot-color="graphQlStore?.state.roomToken ? 'primary' : 'grey-lighten-1'"
                :line-inset="graphQlStore?.state.roomToken ? 5 : 0"
                :size="graphQlStore?.state.roomToken ? 40 : 'default'"
                :fill-dot="Boolean(graphQlStore?.state.roomToken)"
                :density="graphQlStore?.state.roomToken ? 'default' : 'compact'"
              >
                <template v-slot:icon>2</template>
                <div class="text-h6" style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">ユーザーログイン</div>
              </v-timeline-item>
            </v-timeline>
          </v-col>
        </v-row>
        <v-row justify="center">
          <v-col cols="12" sm="12" md="10" lg="8" xl="6">
            <login-selection-component
              v-if="!graphQlStore?.state.roomToken"
              property="rooms"
              name="部屋名"
              add-button="部屋を作る"
              add-type="add-room"
              :total-column="3"
              v-model="operation"
            >
              <template v-slot:header>
                <th class="text-left" style="width: 8em;">作成日</th>
              </template>
              <template v-slot:body="props">
                <td>{{ formatDate((props.data as any).createdAt) }}</td>
              </template>
            </login-selection-component>
            <login-selection-component
              v-else-if="!graphQlStore?.state.userToken"
              property="users"
              name="ユーザー名"
              add-button="ユーザーを作る"
              add-type="sign-up"
              :total-column="3"
              v-model="operation"
            >
              <template v-slot:header>
                <th class="text-left" style="width: 8em;">最終ログイン</th>
              </template>
              <template v-slot:body="props">
                <td>{{ formatDate((props.data as any).lastLoggedIn) }}</td>
              </template>
            </login-selection-component>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <v-navigation-drawer
      :model-value="true"
      :temporary="true"
      :permanent="true"
      :floating="false"
      :scrim="false"
      :disable-resize-watcher="true"
      location="right"
      width="300"
    >
      <entry-component
        v-if="!graphQlStore?.state.roomToken"
        name="部屋"
        entry-button="入室する"
        :selected-object="selectedRoom"
        :selectable="Boolean(graphQlStore?.state.rooms.length)"
        add-type="add-room"
        v-model="operation"
        @add="addRoom"
        @entry="entryRoom"
      >
        <v-card-subtitle class="mb-2">ユーザー数：{{ (selectedRoom as Room)?.users.length }}人</v-card-subtitle>
      </entry-component>
      <entry-component
        v-else-if="!graphQlStore?.state.userToken"
        name="ユーザー"
        entry-button="サインイン"
        :selected-object="selectedUser"
        :selectable="Boolean(graphQlStore?.state.users.length)"
        add-type="sign-up"
        v-model="operation"
        @add="signUp"
        @entry="signIn"
      />
    </v-navigation-drawer>
  </template>
</template>

<script lang="ts" setup>
import {inject, ref, computed} from 'vue'
import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import {format, isToday} from 'date-fns'
import LoginSelectionComponent from '@/components/entry/LoginSelectionComponent.vue'
import EntryComponent from '@/components/entry/EntryComponent.vue'
import {Room, User} from "@/components/graphql/schema";

const operation = ref<string | null>(null)

const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const selectedRoom = computed<Room | undefined>(
  () => !graphQlStore ? undefined : graphQlStore.state.rooms.find(r => r.id === operation.value)
)
const selectedUser = computed<User | undefined>(
  () => !graphQlStore ? undefined : graphQlStore.state.users.find(u => u.id === operation.value)
)

function formatDate(unixTime: number) {
  const date = new Date(unixTime * 1000)
  let formatStr: string
  if (isToday(date)) {
    formatStr = 'HH:mm:ss'
  } else {
    formatStr = 'yyyy/MM/dd'
  }
  return format(date, formatStr)
}

const addRoom = graphQlStore?.addRoom || (() => console.log('UnSupported addRoom'))
const entryRoom = graphQlStore?.entryRoom || (() => console.log('UnSupported entryRoom'))
const signUp = graphQlStore?.signUp || (() => console.log('UnSupported signUp'))
const signIn = graphQlStore?.signIn || (() => console.log('UnSupported signIn'))
</script>

<style lang="scss" scoped>
::v-deep(.v-timeline-item__body) {
  padding-block-end: 5px !important;
}
</style>

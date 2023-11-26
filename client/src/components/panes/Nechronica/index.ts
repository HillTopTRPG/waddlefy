// noinspection TypeScriptCheckImport
import ActorManagePane, {
  componentInfo as ActorManagePaneInfo
} from '@/components/panes/Nechronica/ActorManagePane.vue'
import ActorViewPane, {
  componentInfo as ActorViewPaneInfo
} from '@/components/panes/Nechronica/ActorViewPane.vue'

const group = 'ネクロニカ'

export default [
  {
    component: ActorManagePane,
    info: ActorManagePaneInfo,
    group: group
  },
  {
    component: ActorViewPane,
    info: ActorViewPaneInfo,
    group: group
  }
]

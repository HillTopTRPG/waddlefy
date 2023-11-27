// noinspection TypeScriptCheckImport
import ActorManagePane, {
  componentInfo as ActorManagePaneInfo
} from '@/components/panes/Nechronica/ActorManagePane.vue'
import ActorViewPane, { componentInfo as ActorViewPaneInfo } from '@/components/panes/Nechronica/ActorViewPane.vue'
import SessionProgressPane, {
  componentInfo as SessionProgressPaneInfo
} from '@/components/panes/Nechronica/SessionProgressPane.vue'
import TipsPane, { componentInfo as TipsPaneInfo } from '@/components/panes/Nechronica/TipsPane.vue'

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
  },
  {
    component: SessionProgressPane,
    info: SessionProgressPaneInfo,
    group: group
  },
  {
    component: TipsPane,
    info: TipsPaneInfo,
    group: group
  }
]

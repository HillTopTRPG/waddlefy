// noinspection TypeScriptCheckImport
import CharacterManagePane, {
  componentInfo as CharacterManagePaneInfo
} from '@/components/panes/Nechronica/CharacterManagePane.vue'
import CharacterViewPane, {
  componentInfo as CharacterViewPaneInfo
} from '@/components/panes/Nechronica/CharacterViewPane.vue'
import TipsPane, { componentInfo as TipsPaneInfo } from '@/components/panes/Nechronica/TipsPane.vue'

const group = 'ネクロニカ'

export default [
  {
    component: CharacterManagePane,
    info: CharacterManagePaneInfo,
    group: group
  },
  {
    component: CharacterViewPane,
    info: CharacterViewPaneInfo,
    group: group
  },
  {
    component: TipsPane,
    info: TipsPaneInfo,
    group: group
  }
]

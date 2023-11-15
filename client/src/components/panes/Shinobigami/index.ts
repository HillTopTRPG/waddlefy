// noinspection TypeScriptCheckImport
import CharacterSheetManagePane, {
  componentInfo as CharacterSheetManagePaneInfo
} from '@/components/panes/Shinobigami/CharacterSheetManagePane.vue'
import DataViewPane, { componentInfo as DataViewPaneInfo } from './DataViewPane.vue'
import ScenarioDataManagePane, { componentInfo as ScenarioDataManagePaneInfo } from './ScenarioDataManagePane.vue'
import SpecialityTableDiffPane, { componentInfo as SpecialityTableDiffPaneInfo } from './SpecialityTableDiffPane.vue'

const group = 'シノビガミ'

export default [
  {
    component: SpecialityTableDiffPane,
    info: SpecialityTableDiffPaneInfo,
    group: group
  },
  {
    component: DataViewPane,
    info: DataViewPaneInfo,
    group: group
  },
  {
    component: CharacterSheetManagePane,
    info: CharacterSheetManagePaneInfo,
    group: group
  },
  {
    component: ScenarioDataManagePane,
    info: ScenarioDataManagePaneInfo,
    group: group
  }
]

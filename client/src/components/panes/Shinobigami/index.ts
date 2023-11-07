// noinspection TypeScriptCheckImport
import SpecialityTableDiffPane, { componentInfo as SpecialityTableDiffPaneInfo } from './SpecialityTableDiffPane.vue'
import DataViewPane, { componentInfo as DataViewPaneInfo } from './DataViewPane.vue'
import CharacterSheetManagePane, {
  componentInfo as CharacterSheetManagePaneInfo
} from '@/components/panes/Shinobigami/CharacterSheetManagePane.vue'
import ScenarioDataManagePane, { componentInfo as ScenarioDataManagePaneInfo } from './ScenarioDataManagePane.vue'

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

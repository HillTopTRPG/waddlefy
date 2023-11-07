// noinspection TypeScriptCheckImport
import SpecialityTableDiffPane, { componentInfo as SpecialityTableDiffPaneInfo } from './SpecialityTableDiffPane.vue'
import CharacterSheetViewPane, { componentInfo as CharacterSheetViewPaneInfo } from './CharacterSheetViewPane.vue'
import CharacterSheetManagePane, {
  componentInfo as CharacterSheetManagePaneInfo
} from '@/components/panes/Shinobigami/CharacterSheetManagePane.vue'
import HandoutManagePane, { componentInfo as HandoutManagePaneInfo } from './HandoutManagePane.vue'

const group = 'シノビガミ'

export default [
  {
    component: SpecialityTableDiffPane,
    info: SpecialityTableDiffPaneInfo,
    group: group
  },
  {
    component: CharacterSheetViewPane,
    info: CharacterSheetViewPaneInfo,
    group: group
  },
  {
    component: CharacterSheetManagePane,
    info: CharacterSheetManagePaneInfo,
    group: group
  },
  {
    component: HandoutManagePane,
    info: HandoutManagePaneInfo,
    group: group
  }
]

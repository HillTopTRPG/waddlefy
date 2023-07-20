// noinspection TypeScriptCheckImport
import SpecialityTableDiffPane, { componentInfo as SpecialityTableDiffPaneInfo } from './SpecialityTableDiffPane.vue'
import CharacterSheetViewPane, { componentInfo as CharacterSheetViewPaneInfo } from './CharacterSheetViewPane.vue'

const group = 'シノビガミ'

export default [
  {
    component: SpecialityTableDiffPane,
    info     : SpecialityTableDiffPaneInfo,
    group    : group,
  },
  {
    component: CharacterSheetViewPane,
    info     : CharacterSheetViewPaneInfo,
    group    : group,
  },
]

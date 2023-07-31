import DefaultLayout from '@/PaneLayoutTemplate/DefaultLayout'
import SpecialityTableDiffPaneLayout from '@/PaneLayoutTemplate/Shinobigami/SpecialityTableDiffPaneLayout'
import { GraphQlStore } from '@/components/graphql/graphql'
import CharacterSheetViewPaneLayout from '@/PaneLayoutTemplate/Shinobigami/CharacterSheetViewPaneLayout'
import CharacterSheetManagePaneLayout from '@/PaneLayoutTemplate/Shinobigami/CharacterSheetManagePaneLayout'

export default [
  {
    layout: DefaultLayout,
    title : '空のペインのみ',
  },
]

export async function addDashboards(graphQlStore: GraphQlStore, sessionType: string) {
  if (sessionType === 'Shinobigami') {
    await graphQlStore.addDashboard('特技表比較', SpecialityTableDiffPaneLayout)
    await graphQlStore.addDashboard('キャラクターシート表示', CharacterSheetViewPaneLayout)
    await graphQlStore.addDashboard('キャラクターシート管理', CharacterSheetManagePaneLayout)
  }
}

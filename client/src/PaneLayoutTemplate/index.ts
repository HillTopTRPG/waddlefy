import DefaultLayout from '@/PaneLayoutTemplate/DefaultLayout'
import SpecialityTableDiffPaneLayout from '@/PaneLayoutTemplate/Shinobigami/SpecialityTableDiffPaneLayout'
import { GraphQlStore } from '@/components/graphql/graphql'

export default [
  {
    layout: DefaultLayout,
    title : '空のペインのみ',
  },
]

export async function addDashboards(graphQlStore: GraphQlStore, sessionType: string) {
  if (sessionType === 'Shinobigami') {
    await graphQlStore.addDashboard('特技表比較', SpecialityTableDiffPaneLayout)
  }
}

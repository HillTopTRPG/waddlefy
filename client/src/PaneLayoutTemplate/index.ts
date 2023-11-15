import DefaultLayout from '@/PaneLayoutTemplate/DefaultLayout'
import CharacterSheetManagePaneLayout from '@/PaneLayoutTemplate/Shinobigami/CharacterSheetManagePaneLayout'
import DataViewPaneLayout from '@/PaneLayoutTemplate/Shinobigami/DataViewPaneLayout'
import ScenarioDataManagePaneLayout from '@/PaneLayoutTemplate/Shinobigami/ScenarioDataManagePaneLayout'
import SpecialityTableDiffPaneLayout from '@/PaneLayoutTemplate/Shinobigami/SpecialityTableDiffPaneLayout'
import { GraphQlStore } from '@/components/graphql/graphql'
import { DashboardOption } from '@/components/graphql/schema'

export default [
  {
    layout: DefaultLayout,
    title: '空のペインのみ'
  }
]

module Scope {
  export const ALL: DashboardOption = {
    scope: 'all'
  }

  export const OWNER: DashboardOption = {
    scope: 'owner'
  }
}

export async function addDashboards(graphQlStore: GraphQlStore, sessionType: string): Promise<string> {
  const waitDashboardNum = (num: number): Promise<void> => {
    return new Promise((resolve: () => void) => {
      const timerId = setInterval(() => {
        const dashboardNum = graphQlStore.state.dashboards.length
        if (dashboardNum === num) {
          clearInterval(timerId)
          resolve()
        }
      }, 200)
    })
  }
  if (sessionType === 'Shinobigami') {
    await graphQlStore.addDashboard('シナリオデータ管理', ScenarioDataManagePaneLayout, Scope.OWNER)
    await graphQlStore.addDashboard('キャラクターシート管理', CharacterSheetManagePaneLayout, Scope.ALL)
    await graphQlStore.addDashboard('データ閲覧', DataViewPaneLayout, Scope.ALL)
    await graphQlStore.addDashboard('特技比較', SpecialityTableDiffPaneLayout, Scope.ALL)
    await waitDashboardNum(4)
    return graphQlStore.state.dashboards.find(d => d.name === 'データ閲覧')?.id || ''
  }
  return ''
}

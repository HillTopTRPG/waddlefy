import { GraphQlStore } from '@/components/graphql/graphql'
import DefaultLayout from '@/PaneLayoutTemplate/DefaultLayout'
import CharacterSheetManagePaneLayout from '@/PaneLayoutTemplate/Shinobigami/CharacterSheetManagePaneLayout'
import CharacterSheetViewPaneLayout from '@/PaneLayoutTemplate/Shinobigami/CharacterSheetViewPaneLayout'
import SpecialityTableDiffPaneLayout from '@/PaneLayoutTemplate/Shinobigami/SpecialityTableDiffPaneLayout'
import { DashboardOption } from '@/components/graphql/schema'
import HandoutManagePaneLayout from '@/PaneLayoutTemplate/Shinobigami/HandoutManagePaneLayout'

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
    await graphQlStore.addDashboard('ハンドアウト管理', HandoutManagePaneLayout, Scope.OWNER)
    await graphQlStore.addDashboard('キャラクターシート管理', CharacterSheetManagePaneLayout, Scope.OWNER)
    await graphQlStore.addDashboard('キャラクターシート表示', CharacterSheetViewPaneLayout, Scope.ALL)
    await graphQlStore.addDashboard('特技比較', SpecialityTableDiffPaneLayout, Scope.ALL)
    await waitDashboardNum(4)
    return graphQlStore.state.dashboards.find(d => d.name === 'キャラクターシート表示')?.id || ''
  }
  return ''
}

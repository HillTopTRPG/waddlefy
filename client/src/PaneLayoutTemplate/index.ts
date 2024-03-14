import { GraphQlStore } from '@/components/graphql/graphql'
import { DashboardOption } from '@/components/graphql/schema'
import DefaultLayout from '@/PaneLayoutTemplate/DefaultLayout'
import CharacterManagePaneLayout from '@/PaneLayoutTemplate/Nechronica/CharacterManagePaneLayout'
import CharacterViewPaneLayout from '@/PaneLayoutTemplate/Nechronica/CharacterViewPaneLayout'
import TipsPaneLayout from '@/PaneLayoutTemplate/Nechronica/TipsPaneLayout'
import CharacterSheetManagePaneLayout from '@/PaneLayoutTemplate/Shinobigami/CharacterSheetManagePaneLayout'
import DataViewPaneLayout from '@/PaneLayoutTemplate/Shinobigami/DataViewPaneLayout'
import ScenarioDataManagePaneLayout from '@/PaneLayoutTemplate/Shinobigami/ScenarioDataManagePaneLayout'
import SpecialityTableDiffPaneLayout from '@/PaneLayoutTemplate/Shinobigami/SpecialityTableDiffPaneLayout'

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
  const waitDashboard = (dashboardName: string): Promise<string> => {
    return new Promise((resolve: (dashboardId: string) => void) => {
      const timerId = setInterval(() => {
        const dashboard = graphQlStore.state.dashboards.find(d => d.name === dashboardName)
        if (dashboard) {
          clearInterval(timerId)
          resolve(dashboard.id)
        }
      }, 100)
    })
  }
  let defaultDashboardId: string | null = null
  if (sessionType === 'Shinobigami') {
    await graphQlStore.addDashboard('シナリオデータ管理', ScenarioDataManagePaneLayout, Scope.OWNER)
    await graphQlStore.addDashboard('キャラクターシート管理', CharacterSheetManagePaneLayout, Scope.ALL)
    await graphQlStore.addDashboard('データ閲覧', DataViewPaneLayout, Scope.ALL)
    await graphQlStore.addDashboard('特技比較', SpecialityTableDiffPaneLayout, Scope.ALL)
    defaultDashboardId = await waitDashboard('データ閲覧')
  }
  if (sessionType === 'Nechronica') {
    await graphQlStore.addDashboard('キャラクター管理', CharacterManagePaneLayout, Scope.ALL)
    await graphQlStore.addDashboard('キャラクター閲覧', CharacterViewPaneLayout, Scope.ALL)
    await graphQlStore.addDashboard('ネクロニカ専用機能のTips', TipsPaneLayout, Scope.ALL)
    defaultDashboardId = await waitDashboard('キャラクター閲覧')
  }
  if (defaultDashboardId) {
    const sessionName = graphQlStore?.state.session?.name || ''
    await graphQlStore.updateSession(sessionName, sessionType, defaultDashboardId)
    await graphQlStore.directDashboardAccess(defaultDashboardId)
  }
  return ''
}

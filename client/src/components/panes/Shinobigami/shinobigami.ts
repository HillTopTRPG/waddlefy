import { createEmotion, createTokugi, Personality, SaikoroFictionTokugi, TokugiInfo } from './SaikoroFiction'
import { convertNumberZero } from './PrimaryDataUtility'
import { getJsonByGet, getJsonByJsonp } from './fetch-util'

export type Background = {
  name: string
  type: string
  point: string
  effect: string
}

export type SpecialArts = {
  name: string
  skill: string
  effect: string
  direction: string
  _openList: string[]
}

export type NinjaTool = {
  name: string
  count: number
  effect: string
}

export type NinjaArts = {
  secret: boolean
  name: string
  type: string
  targetSkill: string
  range: string
  cost: string
  effect: string
  page: string
}

export type ShinobiGami = {
  url: string
  playerName: string
  characterName: string
  characterNameKana: string
  regulation: string
  foe: string
  exp: string
  memo: string
  upperStyle: string
  subStyle: string
  level: string
  age: string
  sex: string
  cover: string
  belief: string
  stylerule: string
  ninjaArtsList: NinjaArts[] // 忍法
  personalityList: Personality[] // 人物欄
  scenario: {
    handout: string
    mission: string
    name: string
    pcno: string
  }
  backgroundList: Background[] // 背景
  specialArtsList: SpecialArts[] // 奥義
  ninjaToolList: NinjaTool[] // 忍具
  skill: SaikoroFictionTokugi // 特技
}

export type DiffType = {
  op: 'replace' | 'add' | 'delete'
  path: string
  before: string | number
  after: string | number
}
export function getDiff(d1: ShinobiGami, d2: ShinobiGami): DiffType[] {
  const diffs: DiffType[] = []
  const simpleParams: (keyof Pick<
    ShinobiGami,
    'url',
    'playerName',
    'characterName',
    'characterNameKana',
    'regulation',
    'foe',
    'exp',
    'memo',
    'upperStyle',
    'subStyle',
    'level',
    'age',
    'sex',
    'cover',
    'belief',
    'stylerule'
  >)[] = [
    'url',
    'playerName',
    'characterName',
    'characterNameKana',
    'regulation',
    'foe',
    'exp',
    'memo',
    'upperStyle',
    'subStyle',
    'level',
    'age',
    'sex',
    'cover',
    'belief',
    'stylerule'
  ]
  simpleParams.forEach(p => {
    if (d1[p] === d2[p]) return
    diffs.push({
      op: 'replace',
      path: p.toString(),
      before: d1[p],
      after: d2[p]
    })
  })

  function getDiffTokugiInfo(
    tokugiListOne: TokugiInfo[],
    tokugiListTwo: TokugiInfo[],
    op: 'delete' | 'add',
    path: string
  ): DiffType[] {
    return tokugiListOne
      .filter(t1 => tokugiListTwo.every(t2 => t2.name !== t1.name))
      .map(t1 => ({
        op,
        path,
        before: op === 'delete' ? t1.name : '',
        after: op === 'add' ? t1.name : ''
      }))
  }
  diffs.push(...getDiffTokugiInfo(d1.skill.learnedList, d2.skill.learnedList, 'delete', 'skill.learnedList'))
  diffs.push(...getDiffTokugiInfo(d2.skill.learnedList, d1.skill.learnedList, 'add', 'skill.learnedList'))
  diffs.push(...getDiffTokugiInfo(d1.skill.damagedList, d2.skill.damagedList, 'delete', 'skill.damagedList'))
  diffs.push(...getDiffTokugiInfo(d2.skill.damagedList, d1.skill.damagedList, 'add', 'skill.damagedList'))

  function getDiffSpace(
    spaceListOne: number[],
    spaceListTwo: number[],
    op: 'delete' | 'add',
    path: string,
    mappingList: string[]
  ): DiffType[] {
    return spaceListOne
      .filter(s1 => spaceListTwo.every(s2 => s2 !== s1))
      .map(s1 => ({
        op,
        path,
        before: op === 'delete' ? mappingList[s1] : '',
        after: op === 'add' ? mappingList[s1] : ''
      }))
  }
  const colMappingList = ['器術', '体術', '忍術', '謀術', '戦術', '妖術']
  const spaceMappingList = colMappingList.map((col, idx) => `${colMappingList.slice(idx - 1)[0]}と${col}の間のギャップ`)
  diffs.push(...getDiffSpace(d1.skill.spaceList, d2.skill.spaceList, 'delete', 'skill.spaceList', spaceMappingList))
  diffs.push(...getDiffSpace(d2.skill.spaceList, d1.skill.spaceList, 'add', 'skill.spaceList', spaceMappingList))
  diffs.push(
    ...getDiffSpace(d1.skill.damagedColList, d2.skill.damagedColList, 'delete', 'skill.damagedColList', colMappingList)
  )
  diffs.push(
    ...getDiffSpace(d2.skill.damagedColList, d1.skill.damagedColList, 'add', 'skill.damagedColList', colMappingList)
  )
  if (d1.skill.outRow !== d2.skill.outRow) {
    diffs.push({
      op: d1.skill.outRow ? 'delete' : 'add',
      path: 'skill.outRow',
      before: '特技表の下辺ギャップ',
      after: '特技表の下辺ギャップ'
    })
  }
  return diffs
}

export class ShinobigamiHelper {
  protected readonly url: string
  protected readonly sheetViewPass: string
  protected readonly urlRegExp: RegExp
  protected readonly jsonpUrlFormat: string
  protected readonly jsonpUrlSecretFormat: string

  public constructor(url: string, sheetViewPass: string) {
    this.url = url
    this.sheetViewPass = sheetViewPass
    this.urlRegExp = /https?:\/\/character-sheets\.appspot\.com\/shinobigami\/.+\?key=([^&]+)/
    this.jsonpUrlFormat = 'https://character-sheets.appspot.com/shinobigami/display?ajax=1&key={key}'
    this.jsonpUrlSecretFormat =
      'https://character-sheets.appspot.com/shinobigami/openSecret?ajax=1&key={key}&pass={sheetViewPass}'
  }

  /**
   * このシステムに対応しているキャラシのURLかどうかを判定する
   * @return true: 対応したキャラシである, false: 対応したキャラシではない
   */
  public isThis(): boolean {
    return this.urlRegExp.test(this.url)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getData(): Promise<{
    jsons: any[] | null
    data: ShinobiGami | null
  }> {
    const jsons = await this.getJsonData()
    const data = this.createData(jsons)
    return {
      jsons,
      data
    }
  }

  /**
   * JSONPで対象のURLのデータを取得する
   * @param url 省略された場合はコンストラクタに引き渡されたURLが利用される
   * @param type jsonp or get 省略された場合は jsonp
   * @protected
   * @return JSONPの生データ
   */
  private async getJsonData(
    type: 'jsonp' | 'get' = 'jsonp',
    url: string = this.url
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any[] | null> {
    try {
      const matchResult = url.match(this.urlRegExp)
      const key = matchResult ? matchResult[1] : null
      const jsonUrl = this.jsonpUrlFormat.replace('{key}', key || '')
      const jsonSecretUrl = this.jsonpUrlSecretFormat
        .replace('{key}', key || '')
        .replace('{sheetViewPass}', this.sheetViewPass || '')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const results: any[] = []
      results.push(type === 'jsonp' ? await getJsonByJsonp(jsonUrl) : await getJsonByGet(jsonUrl))
      results.push(type === 'jsonp' ? await getJsonByJsonp(jsonSecretUrl) : await getJsonByGet(jsonSecretUrl))
      return results
    } catch (err) {
      return null
    }
  }

  /**
   * JSONPから取得した生データから処理用のデータを生成する
   * @param jsons JSONPから取得した生データ
   * @protected
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  private createData(jsons: any[] | null): ShinobiGami | null {
    if (!jsons) return null
    const textFilter = (text: string | null) => {
      if (!text) return ''
      return text.trim().replace(/\r?\n/g, '\n')
    }
    return {
      url: this.url,
      playerName: textFilter(jsons[0].base.player),
      characterName: textFilter(jsons[0].base.name),
      characterNameKana: textFilter(jsons[0].base.nameKana),
      regulation: textFilter(jsons[0].base.regulation),
      foe: textFilter(jsons[0].base.foe),
      exp: textFilter(jsons[0].base.exp),
      memo: textFilter(jsons[0].base.memo),
      upperStyle: upperStyleDict[jsons[0].base.upperstyle] || '',
      subStyle: textFilter(jsons[0].base.substyle),
      level: textFilter(jsons[0].base.level),
      age: textFilter(jsons[0].base.age),
      sex: textFilter(jsons[0].base.sex),
      cover: textFilter(jsons[0].base.cover),
      belief: textFilter(jsons[0].base.belief),
      stylerule: textFilter(jsons[0].base.stylerule),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ninjaArtsList:
        (jsons[1].ninpou || jsons[0].ninpou)?.map((n: any) => ({
          secret: !!n.secret,
          name: textFilter(n.name),
          type: textFilter(n.type),
          targetSkill: textFilter(n.targetSkill),
          range: textFilter(n.range),
          cost: textFilter(n.cost),
          effect: textFilter(n.effect),
          page: textFilter(n.page)
        })) || [],
      personalityList: createEmotion(jsons[0]),
      scenario: {
        handout: textFilter(jsons[0].scenario.handout),
        mission: textFilter(jsons[0].scenario.mission),
        name: textFilter(jsons[0].scenario.name),
        pcno: textFilter(jsons[0].scenario.pcno)
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      backgroundList: (jsons[0].background as any[]).map(b => ({
        name: textFilter(b.name),
        type: textFilter(b.type),
        point: b.point || '0',
        effect: textFilter(b.effect)
      })),
      skill: createTokugi(jsons[0], SkillTable, true, false, false),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      specialArtsList:
        jsons[1].specialEffect?.map((s: any) => ({
          name: textFilter(s.name),
          skill: textFilter(s.skill),
          effect: textFilter(s.effect),
          direction: textFilter(s.explain),
          _openList: []
        })) || [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ninjaToolList:
        jsons[1].item?.map((t: any) => ({
          name: textFilter(t.name),
          effect: textFilter(t.effect),
          count: convertNumberZero(t.count)
        })) || []
    }
  }
}

const upperStyleDict: { [key: string]: string } = {
  a: '斜歯忍軍',
  ab: '鞍馬神流',
  bc: 'ハグレモノ',
  cd: '比良坂機関',
  de: '私立御斎学園',
  e: '隠忍の血統'
}

export const SkillKind: string[] = ['器術', '体術', '忍術', '謀術', '戦術', '妖術']

export const SkillTable: string[][] = [
  ['絡繰術', '騎乗術', '生存術', '医術', '兵糧術', '異形化'],
  ['火術', '砲術', '潜伏術', '毒術', '鳥獣術', '召喚術'],
  ['水術', '手裏剣術', '遁走術', '罠術', '野戦術', '死霊術'],
  ['針術', '手練', '盗聴術', '調査術', '地の利', '結界術'],
  ['仕込み', '身体操術', '腹話術', '詐術', '意気', '封術'],
  ['衣装術', '歩法', '隠形術', '対人術', '用兵術', '言霊術'],
  ['縄術', '走法', '変装術', '遊芸', '記憶術', '幻術'],
  ['登術', '飛術', '香術', '九ノ一の術', '見敵術', '瞳術'],
  ['拷問術', '骨法術', '分身の術', '傀儡の術', '暗号術', '千里眼の術'],
  ['壊器術', '刀術', '隠蔽術', '流言の術', '伝達術', '憑依術'],
  ['掘削術', '怪力', '第六感', '経済力', '人脈', '呪術']
]

export function getRowCol(name: string): { r: number; c: number } {
  let r = -1
  let c = -1
  SkillTable.forEach((rl, rIdx) => {
    const cIdx = rl.findIndex(n => n === name)
    if (cIdx >= 0) {
      r = rIdx
      c = cIdx
    }
  })
  return { r, c }
}

export type TargetValueCalcResult = {
  r: number
  c: number
  name: string
  targetValue: number
}

export function calcTargetValue(name: string, skill: SaikoroFictionTokugi): TargetValueCalcResult[] {
  const { r, c } = getRowCol(name)
  if (r === -1 || c === -1) return []
  return skill.learnedList
    .filter(t => {
      const colDamage = !skill.isUseColDamage || skill.damagedColList.every(c => c !== t.column)
      const singleDamage =
        !skill.isUseSingleDamage || skill.damagedList.every(d => d.row !== t.row || d.column !== t.column)
      return colDamage && singleDamage
    })
    .map(t => {
      const learnedTokugi = SkillTable[t.row][t.column]
      const calcHorizontalMove = (): number => {
        return [...Array(Math.abs(t.column - c))].reduce((accumulator, currentValue_, idx) => {
          const currentColumn = Math.min(t.column, c) + idx
          const targetGapNum = currentColumn === 5 ? 0 : currentColumn + 1
          const isContain = skill.spaceList.some(s => s === targetGapNum)
          return accumulator + (isContain ? 1 : 2)
        }, 0)
      }
      let cMove = calcHorizontalMove()
      // 一番左のギャップが埋まっていたら、左右が繋がっているものとして扱う
      if (skill.spaceList.some(s => s === 0)) {
        const cMoveRight: number = [...Array(6 - Math.abs(t.column - c))].reduce((accumulator, currentValue_, idx) => {
          let currentColumn = Math.max(t.column, c) + idx
          if (currentColumn >= 6) currentColumn -= 6
          const targetGapNum = currentColumn === 5 ? 0 : currentColumn + 1
          const isContain = skill.spaceList.some(s => s === targetGapNum)
          return accumulator + (isContain ? 1 : 2)
        }, 0)
        cMove = Math.min(cMove, cMoveRight)
      }
      let rMove = Math.abs(t.row - r)
      if (skill.outRow) {
        rMove = Math.min(rMove, Math.min(t.row, r) + 11 - Math.max(t.row, r))
      }

      return {
        r: t.row,
        c: t.column,
        name: learnedTokugi,
        targetValue: rMove + cMove + 5
      }
    })
    .sort((v1, v2) => {
      if (v1.targetValue < v2.targetValue) return -1
      return v2.targetValue < v1.targetValue ? 1 : 0
    })
}

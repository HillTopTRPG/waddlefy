import { clone, convertNumberZero } from '../PrimaryDataUtility'
import { getJsonByGet, getJsonByJsonp } from '../fetch-util'

export type NechronicaManeuver = {
  lost: boolean
  used: boolean
  type: number
  typeText: string
  parts: number // hantei
  partsText: string
  name: string
  timing: number
  timingText: string
  cost: string
  range: string
  memo: string
  shozoku: string
}

export type NechronicaRoice = {
  id: number
  name: string // 対象
  pos: string // 種類
  damage: number // 狂気度
  neg: string // 発狂
  breakEffect: string // 発狂効果
  memo: string // 備考など
}

export type Nechronica = {
  url: string
  basic: {
    characterName: string
    position: number
    positionName: string // Position_Name
    mainClass: number // MCLS
    mainClassName: string // MCLS_Name
    subClass: number // SCLS
    subClassName: string // SCLS_Name
  }
  maneuverList: NechronicaManeuver[]
  roiceList: NechronicaRoice[]
}

export const NechronicaPowerList: { text: string; color: string }[] = [
  { text: '', color: '#ffffff' },
  { text: '通常技', color: '#008001' },
  { text: '必殺技', color: '#8b0000' },
  { text: '行動値増加', color: '#d99626' },
  { text: '補助', color: '#8080ff' },
  { text: '妨害', color: '#ff8080' },
  { text: '防御/生贄', color: '#bf80ff' },
  { text: '移動', color: '#dfdf80' }
]

export const NechronicaPartsList: string[] = ['', 'ﾎﾟｼﾞｼｮﾝ', 'ﾒｲﾝｸﾗｽ', 'ｻﾌﾞｸﾗｽ', '頭', '腕', '胴', '足']

export const NechronicaTimingList: { text: string; color: string }[] = [
  { text: 'オート', color: 'primary' },
  { text: 'アクション', color: 'primary' },
  { text: 'ジャッジ', color: 'primary' },
  { text: 'ダメージ', color: 'primary' },
  { text: 'ラピッド', color: 'primary' }
]

export class NechronicaHelper {
  protected readonly url: string
  protected readonly urlRegExp: RegExp
  protected readonly jsonpUrlFormat: string

  public constructor(url: string) {
    this.url = url
    // https://charasheet.vampire-blood.net/1713315
    this.urlRegExp = /https?:\/\/charasheet\.vampire-blood\.net\/([^&]+)/
    this.jsonpUrlFormat = 'https://charasheet.vampire-blood.net/{key}.js?callback=getJson'
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
    data: Nechronica | null
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const results: any[] = []
      results.push(type === 'jsonp' ? await getJsonByJsonp(jsonUrl) : await getJsonByGet(jsonUrl))
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
  private createData(jsons: any[] | null): Nechronica | null {
    if (!jsons || !jsons.length) return null
    const json = jsons[0]
    const textFilter = (text: string | null) => {
      if (!text) return ''
      return text.trim().replace(/\r?\n/g, '\n')
    }
    const transpose = (a: any[][]): any[][] => a[0].map((_: any, c: number) => a.map((r: any) => r[c]))

    const maneuvers = [
      json['Power_Lost'],
      json['Power_Used'],
      json['Power_Type'],
      json['Power_hantei'],
      json['Power_name'],
      json['Power_timing'],
      json['Power_cost'],
      json['Power_range'],
      json['Power_memo'],
      json['Power_shozoku']
    ]
    const maneuverList = transpose(maneuvers).map(list => {
      const type: number = convertNumberZero(list[2])
      const parts: number = convertNumberZero(list[3])
      const timing: number = convertNumberZero(list[5])
      const data: NechronicaManeuver = {
        lost: list[0] !== '0',
        used: list[1] !== '0',
        type,
        typeText: NechronicaPowerList[type]?.text || '',
        parts,
        partsText: NechronicaPartsList[parts] || '',
        name: textFilter(list[4]),
        timing,
        timingText: NechronicaTimingList[timing].text || '',
        cost: textFilter(list[6]),
        range: textFilter(list[7]),
        memo: textFilter(list[8]),
        shozoku: textFilter(list[9])
      }
      return data
    })
    const roice = [
      json['roice_name'],
      json['roice_pos'],
      json['roice_id'],
      json['roice_damage'],
      json['roice_neg'],
      json['roice_break'],
      json['roice_memo']
    ]
    const roiceList: NechronicaRoice[] = transpose(roice)
      .map(list => {
        const name: string = textFilter(list[0])
        const pos: string = textFilter(list[1])
        const id: number = convertNumberZero(list[2])
        const damage: number = convertNumberZero(list[3])
        const neg: string = textFilter(list[4])
        const breakEffect: string = textFilter(list[5])
        const memo: string = textFilter(list[6])
        const data: NechronicaRoice = {
          id,
          name,
          pos,
          damage,
          neg,
          breakEffect,
          memo
        }
        return data
      })
      .filter(r => Boolean(r.name))
    const nechnorica: Nechronica = {
      url: this.url,
      basic: {
        characterName: textFilter(json.pc_name),
        position: convertNumberZero(json.position),
        positionName: textFilter(json['Position_Name']),
        mainClass: convertNumberZero(json['MCLS']),
        mainClassName: textFilter(json['MCLS_Name']),
        subClass: convertNumberZero(json['SCLS']),
        subClassName: textFilter(json['SCLS_Name'])
      },
      maneuverList,
      roiceList
    }
    return nechnorica
  }
}

export type DataType = 'maneuver' | 'roice' | 'basic'
export const fullDataType: DataType[] = ['maneuver', 'roice', 'basic']

export function mergeNechronica(oldData: Nechronica, mergeData: Nechronica, targets: DataType[]): Nechronica {
  const result: Nechronica = clone<Nechronica>(oldData)!
  if (targets.some(t => t === 'basic')) {
    result.basic = clone(mergeData.basic)!
  }
  if (targets.some(t => t === 'roice')) {
    result.roiceList = clone(mergeData.roiceList)!
  }
  if (targets.some(t => t === 'maneuver')) {
    result.maneuverList = clone(mergeData.maneuverList)!
  }
  return result
}

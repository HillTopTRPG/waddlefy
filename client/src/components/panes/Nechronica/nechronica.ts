import { getJsonByGet, getJsonByJsonp } from '../fetch-util'
import { clone, convertNumberZero } from '../PrimaryDataUtility'
import mapping from './mapping.json'

export type NechronicaManeuver = {
  lost: boolean
  used: boolean
  type: number
  parts: number // hantei
  name: string
  timing: number
  cost: string
  range: string
  memo: string
  shozoku: string
  ignoreHeiki?: boolean
  isHeiki?: boolean
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

export const posSelections = mapping.ROICE.map((r, idx) => ({
  value: idx,
  text: `Nechronica.ROICE.${r.pos}`,
  subTitle: `Nechronica.ROICE.${r.target}`,
  color: 'black'
}))

export type NechronicaType = 'doll' | 'legion' | 'horror' | 'servent'

export type Nechronica = {
  url: string
  basic: {
    characterName: string
    position: number
    mainClass: number // MCLS
    subClass: number // SCLS
    basePosition: number // 0: 煉獄, 1: 花園, 2: 楽園
    hairColor: string
    eyeColor: string
    skinColor: string
    height: string
    weight: string
    age: string
    shuzoku: string
    carma: string
  }
  maneuverList: NechronicaManeuver[]
  roiceList: NechronicaRoice[]
}

export type NechronicaManeuverStack = {
  characterId: string
  maneuverIndex: number
  type: 'use' | 'lost'
  status: '' | 'resolved'
  cost: number
  start: number
  end: number
}

export type NechronicaSingleton = { battleCount?: number; maneuverStack?: NechronicaManeuverStack[] }

export type NechronicaCopiableWrap = {
  position: number
  actionValue: number
  health: number
  hide: boolean
  maxActionValue: number
}

export type NechronicaWrap = NechronicaCopiableWrap & {
  player: string
  type: NechronicaType
  backboneStack: boolean
  character: Nechronica
}

export function getActionValueNum(text: string): number {
  const matchResult = text.match(/-?[0-9０-９]+/)
  const numText = matchResult?.at(0)?.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
  return numText ? parseInt(numText, 10) : 0
}

export class NechronicaHelper {
  protected readonly url: string
  protected readonly urlRegExp: RegExp
  protected readonly jsonpUrlFormat: string
  protected readonly t: (r: string) => string

  public constructor(url: string, t: (r: string) => string) {
    this.url = url
    // https://charasheet.vampire-blood.net/1713315
    this.urlRegExp = /https?:\/\/charasheet\.vampire-blood\.net\/([^&]+)/
    this.jsonpUrlFormat = 'https://charasheet.vampire-blood.net/{key}.js?callback=getJson'
    this.t = t
  }

  /**
   * このシステムに対応しているキャラシのURLかどうかを判定する
   * @return true: 対応したキャラシである, false: 対応したキャラシではない
   */
  public isThis(): boolean {
    return this.urlRegExp.test(this.url)
  }

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
  private async getJsonData(type: 'jsonp' | 'get' = 'jsonp', url: string = this.url): Promise<any[] | null> {
    try {
      const matchResult = url.match(this.urlRegExp)
      const key = matchResult ? matchResult[1] : null
      const jsonUrl = this.jsonpUrlFormat.replace('{key}', key || '')

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
      const name = textFilter(list[4])
      const data: NechronicaManeuver = {
        lost: list[0] !== '0',
        used: list[1] !== '0',
        type: convertNumberZero(list[2]),
        parts: convertNumberZero(list[3]),
        name,
        timing: convertNumberZero(list[5]),
        cost: textFilter(list[6]),
        range: textFilter(list[7]),
        memo: textFilter(list[8]),
        shozoku: textFilter(list[9]),
        isHeiki: ['平気', '自動制御装置'].includes(name)
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
    const test = this.t('Nechronica.ROICE.1.pos')
    console.log(test)
    const roiceList: NechronicaRoice[] = transpose(roice)
      .map(list => {
        const name: string = textFilter(list[0])
        const damage: number = convertNumberZero(list[3])
        const id: number = convertNumberZero(list[2])
        const pos: string = `Nechronica.ROICE.${id}.pos`
        const neg: string = `Nechronica.ROICE.${id}.neg`
        const breakEffect: string = `Nechronica.ROICE.${id}.breakEffect`
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
    window.logger.info(JSON.stringify(json, null, 2))
    return {
      url: this.url,
      basic: {
        characterName: textFilter(json.pc_name) || textFilter(json.data_title),
        position: convertNumberZero(json.position),
        mainClass: convertNumberZero(json['MCLS']),
        subClass: convertNumberZero(json['SCLS']),
        basePosition: parseInt(json['SL_sex'], 10),
        hairColor: textFilter(json.color_hair),
        eyeColor: textFilter(json.color_eye),
        skinColor: textFilter(json.color_skin),
        height: textFilter(json.pc_height),
        weight: textFilter(json.pc_weight),
        age: textFilter(json.age),
        shuzoku: textFilter(json.shuzoku),
        carma: textFilter(json.pc_carma)
      },
      maneuverList,
      roiceList
    }
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

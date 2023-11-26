import { clone, convertNumberZero } from '../PrimaryDataUtility'
import { getJsonByGet, getJsonByJsonp } from '../fetch-util'

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

export const roiceList: (Pick<NechronicaRoice, 'pos' | 'neg' | 'breakEffect'> & { target: string })[] = [
  { pos: '', target: '', neg: '', breakEffect: '' },
  {
    pos: '嫌悪',
    target: '姉妹01',
    neg: '敵対認識',
    breakEffect: '敵に当たらない攻撃の全てが、射程内なら嫌悪の対象に命中する(部位は受ける方が任意に決める)'
  },
  {
    pos: '独占',
    target: '姉妹02',
    neg: '独占衝動',
    breakEffect: '戦闘開始時と終了時に１つずつ、対象はパーツを選んで損傷しなければならない'
  },
  { pos: '依存', target: '姉妹03', neg: '幼児退行', breakEffect: '最大行動値減少(-2)' },
  {
    pos: '執着',
    target: '姉妹04',
    neg: '追尾監視',
    breakEffect: '戦闘開始時と終了時に１つずつ、対象はあなたへの未練に狂気点を得る'
  },
  {
    pos: '恋心',
    target: '姉妹05',
    neg: '自傷行動',
    breakEffect: '戦闘開始時と終了時に１つずつ、あなたはパーツを選んで損傷する'
  },
  {
    pos: '対抗',
    target: '姉妹06',
    neg: '過剰競争',
    breakEffect: '戦闘開始時と終了時に１つずつ、あなたは狂気点を追加で得る'
  },
  {
    pos: '友情',
    target: '姉妹07',
    neg: '共鳴依存',
    breakEffect:
      'セッション終了時、対象の方が損傷しているパーツの数が多い場合、対象の損傷数と同じになるようパーツを選び損傷させなければならない'
  },
  {
    pos: '保護',
    target: '姉妹08',
    neg: '常時密着',
    breakEffect:
      '自身か対象以外は移動マニューバの対象にできない。また、対象が違うエリアにいるなら移動以外の効果持ちのマニューバは宣言できない'
  },
  {
    pos: '憧憬',
    target: '姉妹09',
    neg: '贋作妄想',
    breakEffect:
      '自身か対象以外は移動マニューバの対象にできない。また、対象が同じエリアにいるなら移動以外の効果持ちのマニューバは宣言できない'
  },
  { pos: '信頼', target: '姉妹10', neg: '疑心暗鬼', breakEffect: 'あなた以外の全ての姉妹の最大行動値に-1' },
  { pos: '恐怖', target: '敵01', neg: '認識拒否', breakEffect: 'あらゆる行動並びに狂気判定に-1' },
  { pos: '隷属', target: '敵02', neg: '造反有理', breakEffect: '失敗した攻撃判定を全て大失敗にする' },
  { pos: '不安', target: '敵03', neg: '挙動不審', breakEffect: '最大行動値減少(-2)' },
  { pos: '憐憫', target: '敵04', neg: '過剰移入', breakEffect: 'サヴァントに攻撃する時、出目に-1' },
  {
    pos: '愛憎',
    target: '敵05',
    neg: '凶愛心中',
    breakEffect: '狂気および攻撃判定に大成功した時、(結果-10)個のパーツを損傷'
  },
  { pos: '悔恨', target: '敵06', neg: '自業自棄', breakEffect: '失敗した攻撃判定は自身の任意の部位に命中する。' },
  { pos: '軽蔑', target: '敵07', neg: '眼中不在', breakEffect: '同一エリアにいる敵があなたに行う攻撃判定に+1' },
  { pos: '憤怒', target: '敵08', neg: '激情暴走', breakEffect: 'あらゆる行動並びに狂気判定に-1' },
  {
    pos: '怨念',
    target: '敵09',
    neg: '不倶戴天',
    breakEffect: '逃走不能になり、この未練の対象か自身以外にマニューバを使用時、追加コスト「行動値1」が必要になる'
  },
  {
    pos: '憎悪',
    target: '敵10',
    neg: '痕跡破壊',
    breakEffect: '発狂時のみ適用。自身を除く姉妹の誰か一人を選択。対象はパーツを任意で2つ損傷させる'
  },
  {
    pos: '忌避',
    target: '中立者01',
    neg: '隔絶意識',
    breakEffect:
      '自身の未練の対象とサヴァントが自分と同エリアにいる時、移動以外のマニューバを使えない。また、自身か先述条件の対象以外を移動マニューバの対象にできない'
  },
  { pos: '嫉妬', target: '中立者02', neg: '不協和音', breakEffect: '全ての姉妹の行動判定に-1' },
  { pos: '依存', target: '中立者03', neg: '幼児退行', breakEffect: '最大行動値減少(-2)' },
  { pos: '憐憫', target: '中立者04', neg: '過剰移入', breakEffect: 'サヴァントに攻撃する時、出目に-1' },
  {
    pos: '感謝',
    target: '中立者05',
    neg: '病的返礼',
    breakEffect: '発狂時に起動。任意の基本パーツ２つを損傷。なければレベルの最も低いパーツ1つを損傷'
  },
  { pos: '悔恨', target: '中立者06', neg: '自業自棄', breakEffect: '失敗した攻撃判定は自身の任意の部位に命中する。' },
  {
    pos: '期待',
    target: '中立者07',
    neg: '希望転結',
    breakEffect: '狂気点を追加して振り直すごとに出目に-1の修正。これは累積する'
  },
  { pos: '保護', target: '中立者08', neg: '生前回帰', breakEffect: '「レギオン」をマニューバの対象にできなくなる' },
  { pos: '尊敬', target: '中立者09', neg: '神化崇拝', breakEffect: '他の姉妹をマニューバの対象に選べなくなる' },
  { pos: '信頼', target: '中立者10', neg: '疑心暗鬼', breakEffect: 'あなた以外の全ての姉妹の最大行動値に-1' }
]

export const posSelections = roiceList.map((r, idx) => ({
  value: idx,
  text: r.pos,
  subTitle: r.target,
  color: 'black'
}))

export const roiceDamages = [
  { value: 0, label: '０', text: '０', subTitle: '', color: 'success' },
  { value: 1, label: '１', text: '１', subTitle: '', color: 'success' },
  { value: 2, label: '２', text: '２', subTitle: '', color: 'success' },
  { value: 3, label: '３', text: '３', subTitle: '', color: 'warning' },
  { value: 4, label: '狂', text: '発狂', subTitle: '', color: 'error' }
]

export type Nechronica = {
  url: string
  basic: {
    characterName: string
    position: number
    mainClass: number // MCLS
    subClass: number // SCLS
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
      const data: NechronicaManeuver = {
        lost: list[0] !== '0',
        used: list[1] !== '0',
        type: convertNumberZero(list[2]),
        parts: convertNumberZero(list[3]),
        name: textFilter(list[4]),
        timing: convertNumberZero(list[5]),
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
        mainClass: convertNumberZero(json['MCLS']),
        subClass: convertNumberZero(json['SCLS'])
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

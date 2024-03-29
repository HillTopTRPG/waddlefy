import { getJsonByGet, getJsonByJsonp } from '../fetch-util'

export type ShinobigamiPC = {
  intro: string
  mission: string
  name: string
  recommend: string
  secret: string
}

export type ShinobigamiNPC = ShinobigamiPC & {
  secretcheck: boolean
}

export type RightHand = {
  menace: string
  name: string
  notes: string
}

export type Enigma = {
  // 脅威度
  menace: string
  // 偽装
  name: string
  // 説明
  notes: string
  // 戦力
  power: string
  // バインド
  target: string
}

export type Prize = {
  careerClose: string
  careerOpen: string
  name: string
  secret: boolean
}

export type Summary = {
  contents: string
  secret: boolean
  title: string
}

export type ScenarioCharacter = {
  inputUrl: string
  note: string
  secret: boolean
}

export type ShinobiGamiScenario = {
  base: {
    author: string
    boss: {
      name: string
      secret: boolean
    }
    limit: string
    menace: string
    menaceShinobigamiPC: string
    num: string
    publicview: boolean
    name: string
    scene: string
    seq1: boolean
    seq2: boolean
    seq3: boolean
    stage: string
    type1: boolean
    type2: boolean
    type3: boolean
    type4: boolean
  }
  characters: ScenarioCharacter[]
  enigma: Enigma[]
  npc: ShinobigamiNPC[]
  pc: ShinobigamiPC[]
  // プライズ
  prize: Prize[]
  // 腹心
  righthand: RightHand[]
  // サマリー
  summary: Summary[]
}

export class ShinobigamiScenarioHelper {
  protected readonly url: string
  protected readonly sheetViewPass: string
  protected readonly urlRegExp: RegExp
  protected readonly jsonpUrlSecretFormat: string

  public constructor(url: string, sheetViewPass: string) {
    this.url = url
    this.sheetViewPass = sheetViewPass
    this.urlRegExp = /https?:\/\/character-sheets\.appspot\.com\/sgScenario\/.+\?key=([^&]+)/
    this.jsonpUrlSecretFormat =
      'https://character-sheets.appspot.com/sgScenario/openSecret?ajax=1&key={key}&pass={sheetViewPass}'
  }

  /**
   * このシステムに対応しているキャラシのURLかどうかを判定する
   * @return true: 対応したキャラシである, false: 対応したキャラシではない
   */
  public isThis(): boolean {
    return this.urlRegExp.test(this.url)
  }

  public async getData(): Promise<{ jsons: any[] | null; data: ShinobiGamiScenario | null }> {
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
      const jsonSecretUrl = this.jsonpUrlSecretFormat
        .replace('{key}', key || '')
        .replace('{sheetViewPass}', this.sheetViewPass || '')

      const results: any[] = []
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
  private createData(jsons: any[] | null): ShinobiGamiScenario | null {
    if (!jsons) return null
    const json = jsons[0]
    window.logger.info(JSON.stringify(json, null, 2))
    if (json.error) return null
    const textFilter = (text: string | null): string => text?.trim().replace(/\r?\n/g, '\n') || ''
    const boolFilter = (text: string | null): boolean => text === '1'
    return {
      base: {
        author: textFilter(json.base.author),
        boss: {
          name: textFilter(json.base.boss.name),
          secret: boolFilter(json.base.boss.secret)
        },
        limit: textFilter(json.base.limit),
        num: textFilter(json.base.num),
        name: textFilter(json.base.name),
        menace: textFilter(json.base.menace),
        menaceShinobigamiPC: textFilter(json.base.menaceShinobigamiPC),
        publicview: boolFilter(json.base.publicview),
        scene: textFilter(json.base.scene),
        seq1: boolFilter(json.base.seq1),
        seq2: boolFilter(json.base.seq2),
        seq3: boolFilter(json.base.seq3),
        type1: boolFilter(json.base.type1),
        type2: boolFilter(json.base.type2),
        type3: boolFilter(json.base.type3),
        type4: boolFilter(json.base.type4),
        stage: textFilter(json.base.stage)
      },
      npc: json.npc
        .map((n: any) => ({
          intro: textFilter(n.intro),
          name: textFilter(n.name),
          mission: textFilter(n.mission),
          recommend: textFilter(n.recommend),
          secret: textFilter(n.secret),
          secretcheck: boolFilter(n.secretcheck)
        }))
        .filter((n: any) => Boolean(`${n.intro}${n.name}${n.mission}${n.recommend}${n.secret}`)),
      pc: json.pc
        .map((n: any) => ({
          intro: textFilter(n.intro),
          name: textFilter(n.name),
          mission: textFilter(n.mission),
          recommend: textFilter(n.recommend),
          secret: textFilter(n.secret)
        }))
        .filter((n: any) => Boolean(`${n.intro}${n.name}${n.mission}${n.recommend}${n.secret}`)),
      characters: json.characters
        .map((n: any) => ({
          inputUrl: textFilter(n.inputUrl),
          note: textFilter(n.note),
          secret: boolFilter(n.secret)
        }))
        .filter((n: any) => Boolean(n.inputUrl) || Boolean(n.note)),
      enigma: json.enigma
        .map((n: any) => ({
          name: textFilter(n.name),
          menace: textFilter(n.menace),
          notes: textFilter(n.notes),
          power: textFilter(n.power),
          target: textFilter(n.target)
        }))
        .filter((n: any) => Boolean(`${n.name}${n.menace}${n.notes}${n.power}${n.target}`)),
      prize: json.prize
        .map((n: any) => ({
          careerClose: textFilter(n.careerClose),
          careerOpen: textFilter(n.careerOpen),
          name: textFilter(n.name),
          secret: boolFilter(n.secret)
        }))
        .filter((n: any) => Boolean(n.careerClose) || Boolean(n.careerOpen) || Boolean(n.name)),
      righthand: json.righthand
        .map((n: any) => ({
          menace: textFilter(n.menace),
          name: textFilter(n.name),
          notes: textFilter(n.notes)
        }))
        .filter((n: any) => Boolean(n.menace) || Boolean(n.name) || Boolean(n.notes)),
      summary: json.summary
        .map((n: any) => ({
          contents: textFilter(n.contents),
          secret: boolFilter(n.secret),
          title: textFilter(n.title)
        }))
        .filter((n: any) => Boolean(n.contents) || Boolean(n.title))
    }
  }
}

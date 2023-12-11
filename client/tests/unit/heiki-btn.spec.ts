import HeikiBtn from '@/components/panes/Nechronica/component/HeikiBtn.vue'
import { VueWrapper } from '@vue/test-utils'
import { createSimpleClassTest, factory, SimpleClassTestInfo } from '../common'

interface HeikiBtnProps {
  ignoreHeiki: boolean
}

const factoryWrap = factory.bind(null, HeikiBtn)

describe('HeikiBtn.vue', (): void => {
  describe('コンテンツの確認', (): void => {
    it('テキストの確認', () => {
      const wrapper: VueWrapper = factoryWrap({ ignoreHeiki: true })
      expect(wrapper.text()).toContain('平気')
      wrapper.unmount()
    })
  })

  describe('emitsの確認', (): void => {
    it('clickイベントでclickが発火されること', async () => {
      const wrapper: VueWrapper = factoryWrap({ ignoreHeiki: true })
      await wrapper.trigger('click')
      expect(wrapper.emitted()).toHaveProperty('click')
      wrapper.unmount()
    })
  })

  describe('classの確認', (): void => {
    const patterns: SimpleClassTestInfo[] = [
      { title: '文字サイズがcaptionであること', selector: '.v-btn', containClass: 'text-caption' },
      { title: 'densityがcomfortableであること', selector: '.v-btn', containClass: 'v-btn--density-comfortable' },
      { title: 'sizeがdefaultであること', selector: '.v-btn', containClass: 'v-btn--size-default' },
      { title: 'variantがelevatedであること', selector: '.v-btn', containClass: 'v-btn--variant-elevated' },
      { title: 'パディングがpx-1であること', selector: '.v-btn', containClass: 'px-1' }
    ]
    patterns.forEach(createSimpleClassTest.bind(null, factoryWrap.bind(null, { ignoreHeiki: true })))
  })

  describe('ignoreHeiki: trueの場合', () => {
    let wrapper: VueWrapper
    beforeEach(() => (wrapper = factoryWrap({ ignoreHeiki: true })))
    afterEach(() => wrapper.unmount())

    it('スナップショットテスト', () => expect(wrapper.element).toMatchSnapshot())
    it('propsの確認', () => expect((wrapper.props() as HeikiBtnProps).ignoreHeiki).toBeTruthy())

    const patterns: SimpleClassTestInfo[] = [
      { title: '背景色がgreyであること', selector: '.v-btn', containClass: 'bg-grey' },
      { title: 'iconがmdi-skullとなること', selector: '.v-icon', containClass: 'mdi-skull' },
      {
        title: 'テキストに取り消し線がつくこと',
        selector: '.v-btn__content [data-cy=text]',
        containClass: 'text-decoration-line-through'
      }
    ]
    patterns.forEach(createSimpleClassTest.bind(null, factoryWrap.bind(null, { ignoreHeiki: true })))
  })

  describe('ignoreHeik: falseの場合', () => {
    let wrapper: VueWrapper
    beforeEach(() => (wrapper = factoryWrap({ ignoreHeiki: false })))
    afterEach(() => wrapper.unmount())

    it('スナップショットテスト', () => expect(wrapper.element).toMatchSnapshot())
    it('propsの確認', () => expect((wrapper.props() as HeikiBtnProps).ignoreHeiki).toBeFalsy())

    const patterns: SimpleClassTestInfo[] = [
      { title: '背景色がinfoであること', selector: '.v-btn', containClass: 'bg-info' },
      { title: 'iconがmdi-emoticon-tongueとなること', selector: '.v-icon', containClass: 'mdi-emoticon-tongue' },
      {
        title: 'テキストに取り消し線がつかないこと',
        selector: '.v-btn__content [data-cy=text]',
        not: true,
        containClass: 'text-decoration-line-through'
      }
    ]
    patterns.forEach(createSimpleClassTest.bind(null, factoryWrap.bind(null, { ignoreHeiki: false })))
  })
})

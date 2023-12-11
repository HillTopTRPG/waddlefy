import HeikiBtn from '@/components/panes/Nechronica/component/HeikiBtn.vue'
import { VueWrapper } from '@vue/test-utils'
import { createSimpleClassTest, factory, SimpleClassTestInfo } from '../common'

interface HeikiBtnProps {
  ignoreHeiki: boolean
}

function factoryWrap(props: HeikiBtnProps) {
  return factory(HeikiBtn, props)
}

describe('HeikiBtn.vue', (): void => {
  describe('コンテンツの確認', (): void => {
    it('テキストの確認', () => {
      const wrapper: VueWrapper = factoryWrap({ ignoreHeiki: true })
      expect(wrapper.text()).toContain('平気')
    })
  })

  describe('emitsの確認', (): void => {
    it('clickイベントでclickが発火されること', async (): Promise<void> => {
      const wrapper: VueWrapper = factoryWrap({ ignoreHeiki: true })
      await wrapper.trigger('click')
      expect(wrapper.emitted()).toHaveProperty('click')
    })
  })

  describe('classの確認', (): void => {
    const wrapper: VueWrapper = factoryWrap({ ignoreHeiki: true })
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
    const wrapper: VueWrapper = factoryWrap({ ignoreHeiki: true })

    it('スナップショットテスト', (): void => {
      expect(wrapper.element).toMatchSnapshot()
    })

    it('propsの確認', (): void => {
      expect((wrapper.props() as HeikiBtnProps).ignoreHeiki).toBeTruthy()
    })

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
    const wrapper: VueWrapper = factoryWrap({ ignoreHeiki: false })

    it('スナップショットテスト', (): void => {
      expect(wrapper.element).toMatchSnapshot()
    })

    it('propsの確認', (): void => {
      expect((wrapper.props() as HeikiBtnProps).ignoreHeiki).toBeFalsy()
    })

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

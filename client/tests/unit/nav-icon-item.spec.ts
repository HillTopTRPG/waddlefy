import NavIconItem from '@/components/NavIconItem.vue'
import { expect } from '@storybook/test'
import { VueWrapper } from '@vue/test-utils'
import { createSimpleClassTest, factory, SimpleClassTestInfo } from '../common'

interface NavIconItemProps {
  title: string
  subtitle?: string
  rail: boolean
  icon: string
  toggle: boolean
}

function factoryWrap(props: Partial<NavIconItemProps>) {
  const propsWrap: NavIconItemProps = {
    title: '',
    rail: false,
    icon: 'circle',
    toggle: false,
    ...props
  }
  return factory(NavIconItem, propsWrap)
}

function testExistsText(selector: string, text: string, props: Partial<NavIconItemProps>) {
  let wrapper: VueWrapper
  beforeEach(() => (wrapper = factoryWrap({ ...props, rail: false })))
  afterEach(() => wrapper.unmount())

  it('HTMLElementが表示されること', () => expect(wrapper.find(selector).exists()).toBeTruthy())
  it('テキストの文言', () => expect(wrapper.find(selector).text()).toEqual(text))
}

function testNonElement(selector: string, props: Partial<NavIconItemProps>) {
  it(`${selector}が表示されないこと`, () => {
    const wrapper: VueWrapper = factoryWrap({ ...props })
    expect(wrapper.find(selector).exists()).toBeFalsy()
    wrapper.unmount()
  })
}

describe('NavIconItem.vue', (): void => {
  describe('classの確認', (): void => {
    const patterns: SimpleClassTestInfo[] = [
      {
        title: 'アイコンが指定したものになっていること',
        selector: '.v-list-item__prepend .v-icon',
        containClass: 'mdi-circle'
      }
    ]
    patterns.forEach(createSimpleClassTest.bind(null, factoryWrap.bind(null, {})))
  })

  describe('toggle=trueの場合', (): void => {
    it('v-list-itemが角丸であること', () => {
      const wrapper = factoryWrap({ toggle: true })
      const classes = wrapper.find('.v-list-item').classes()
      expect(classes).toContain('radius-border')
      wrapper.unmount()
    })
  })

  describe('toggle=falseの場合', (): void => {
    it('v-list-itemが角丸でないこと', () => {
      const wrapper = factoryWrap({ toggle: false })
      const classes = wrapper.find('.v-list-item').classes()
      expect(classes).not.toContain('radius-border')
      wrapper.unmount()
    })
  })

  describe('rail=trueの場合', (): void => {
    describe('v-list-item-titleの確認', (): void => {
      const selector: string = '.v-list-item-title'

      describe('titleが設定されている場合', (): void => testExistsText(selector, 'Title', { title: 'Title' }))
      describe('titleが空文字の場合', (): void => testExistsText(selector, '', { title: '' }))
    })

    describe('v-list-item-subtitleの確認', (): void => {
      const selector: string = '.v-list-item-subtitle'
      const testNonExists = testNonElement.bind(null, selector)

      describe('subtitleが設定されている場合', () => testExistsText(selector, 'Subtitle', { subtitle: 'Subtitle' }))
      describe('subtitleが空文字の場合', () => testNonExists({ subtitle: '', rail: false }))
      describe('subtitleが未指定の場合', () => testNonExists({ rail: false }))
    })
  })

  describe('rail=trueの場合', (): void => {
    interface Pattern {
      name: string
      selector: string
      props: Partial<NavIconItemProps>
    }
    const patterns: Pattern[] = [
      { name: 'titleが設定されている場合', selector: 'v-list-item-title', props: { title: 'Title' } },
      { name: 'titleが空文字の場合', selector: 'v-list-item-title', props: { title: '' } },
      { name: 'subtitleが設定されている場合', selector: 'v-list-item-subtitle', props: { subtitle: 'Subtitle' } },
      { name: 'subtitleが空文字の場合', selector: 'v-list-item-subtitle', props: { subtitle: '' } },
      { name: 'subtitleが未指定の場合', selector: 'v-list-item-subtitle', props: {} }
    ]
    patterns.forEach(p => describe(p.name, () => testNonElement(p.selector, { ...p.props, rail: true })))
  })
})

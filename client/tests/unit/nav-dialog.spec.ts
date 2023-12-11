import NavDialog from '@/components/NavDialog.vue'
import { VueWrapper } from '@vue/test-utils'
import { createSimpleClassTest, factory, SimpleClassTestInfo } from '../common'

interface NavDialogProps {
  modelValue: boolean
  title: string
}

function factoryWrap(props: Partial<NavDialogProps>) {
  const propsWrap: NavDialogProps = {
    modelValue: true,
    title: 'Sample Title',
    ...props
  }
  return factory(NavDialog, propsWrap)
}

describe('NavDialog.vue', (): void => {
  describe('ダイアログの開閉制御の確認', (): void => {
    describe('modelValueがfalseの場合', (): void => {
      let wrapper: VueWrapper
      beforeEach(() => (wrapper = factoryWrap({ modelValue: false })))
      afterEach(() => wrapper.unmount())

      it('スナップショットテスト', () => expect(wrapper.element).toMatchSnapshot())
      it('ダイアログが非表示状態であること', () => expect(wrapper.find('.v-dialog').exists()).toBeFalsy())
    })
    describe('modelValueがtrueの場合', (): void => {
      let wrapper: VueWrapper
      beforeEach(() => (wrapper = factoryWrap({ modelValue: true })))
      afterEach(() => wrapper.unmount())

      it('スナップショットテスト', () => expect(wrapper.element).toMatchSnapshot())
      it('ダイアログが表示状態であること', () => expect(wrapper.find('.v-dialog').exists()).toBeTruthy())
    })
  })

  describe('コンテンツの確認', (): void => {
    let wrapper: VueWrapper
    beforeEach(() => (wrapper = factoryWrap({ modelValue: true })))
    afterEach(() => wrapper.unmount())

    it('テキストの確認', () => expect(wrapper.find('[data-cy=title-text]').text()).toEqual('Sample Title'))
  })

  describe('閉じるボタンを押した際の挙動', (): void => {
    let wrapper: VueWrapper
    beforeEach(() => {
      wrapper = factoryWrap({ modelValue: true })
      wrapper.find('.v-card-title .v-btn').trigger('click')
      wrapper.vm.$nextTick()
    })
    afterEach(() => wrapper.unmount())

    it('closeが発火すること', () => expect(wrapper.emitted('close')).toEqual([[]]))
    it('ダイアログは表示状態のままであること', () => expect(wrapper.find('.v-dialog').exists()).toBeTruthy())
  })

  describe('classの確認', (): void => {
    const patterns: SimpleClassTestInfo[] = [
      { title: 'タイトル領域がflex-boxであること', selector: '.v-card-title', containClass: 'd-flex' },
      {
        title: 'タイトル領域がjustify-space-betweenであること',
        selector: '.v-card-title',
        containClass: 'justify-space-between'
      },
      { title: 'タイトル領域がalign-centerであること', selector: '.v-card-title', containClass: 'align-center' },
      { title: 'タイトル領域がpy-1であること', selector: '.v-card-title', containClass: 'py-1' },
      {
        title: '閉じるボタンのvariantがtextであること',
        selector: '.v-card-title .v-btn',
        containClass: 'v-btn--variant-text'
      },
      {
        title: '閉じるボタンのsizeがsmallであること',
        selector: '.v-card-title .v-btn',
        containClass: 'v-btn--size-small'
      },
      {
        title: '閉じるボタンのアイコンがmdi-closeであること',
        selector: '.v-card-title .v-btn .v-icon',
        containClass: 'mdi-close'
      }
    ]
    patterns.forEach(createSimpleClassTest.bind(null, factoryWrap.bind(null, { modelValue: true })))
  })
})

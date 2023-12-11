import VSelectThin from '@/components/panes/Nechronica/component/VSelectThin.vue'
import { VueWrapper } from '@vue/test-utils'
import { createSimpleClassTest, factory, SimpleClassTestInfo } from '../common'

interface VSelectThinProps {
  modelValue: string
  prefix: string
  items: { value: string; text: string }[]
}

function factoryWrap(partialProps: Partial<VSelectThinProps>) {
  const props: VSelectThinProps = {
    modelValue: '',
    prefix: 'テスト選択肢',
    items: [
      { value: '', text: '無選択' },
      { value: 'val1', text: '選択肢1' },
      { value: 'val2', text: '選択肢2' }
    ],
    ...partialProps
  }
  return factory(VSelectThin, props)
}

describe('VSelectThin.vue', (): void => {
  describe('コンテンツの確認', (): void => {
    describe('最初の選択肢の場合', (): void => {
      const wrapper: VueWrapper = factoryWrap({ modelValue: '' })

      it('スナップショットテスト', (): void => {
        expect(wrapper.element).toMatchSnapshot()
      })
      it('テキストの確認', () => {
        expect(wrapper.text()).toEqual('テスト選択肢: 無選択')
      })
    })

    describe('選択肢が2番目から3番目に変わった場合', (): void => {
      const wrapper: VueWrapper = factoryWrap({ modelValue: 'val1' })

      it('スナップショットテスト', (): void => {
        expect(wrapper.element).toMatchSnapshot()
      })
      it('テキストの確認', async () => {
        expect(wrapper.text()).toEqual('テスト選択肢: 選択肢1')
        await wrapper.setProps({ modelValue: 'val2' })
        expect(wrapper.text()).toEqual('テスト選択肢: 選択肢2')
      })
    })
  })

  describe('emitsの確認', (): void => {
    it('選択されるとupdate:model-valueが発火されること', async (): Promise<void> => {
      const wrapper: VueWrapper = factoryWrap({ modelValue: '' })
      const select = wrapper.findComponent({ name: 'v-select' })
      await select.vm.select({ value: 'val1' })
      expect(wrapper.emitted('update:model-value')).toEqual([['val1']])
      // 選択肢はまだ変わらない
      expect(wrapper.text()).toEqual('テスト選択肢: 無選択')
    })
  })

  describe('classの確認', (): void => {
    const patterns: SimpleClassTestInfo[] = [
      { title: '角丸がlgであること', selector: '.v-select', containClass: 'rounded-lg' },
      { title: 'decsityがdefaultであること', selector: '.v-select', containClass: 'v-input--density-default' },
      {
        title: 'variantがoutlinedであること',
        selector: '.v-select .v-field',
        containClass: 'v-field--variant-outlined'
      }
    ]
    patterns.forEach(createSimpleClassTest.bind(null, factoryWrap.bind(null, { modelValue: '' })))
  })
})

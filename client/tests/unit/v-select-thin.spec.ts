import VSelectThin from '@/components/panes/Nechronica/component/VSelectThin.vue'
import { expect } from '@storybook/test'
import { VueWrapper } from '@vue/test-utils'
import { describe } from 'vitest'
import { factory } from '../common'

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
      it('テキストの確認', () => {
        const wrapper: VueWrapper = factoryWrap({ modelValue: '' })
        expect(wrapper.text()).toEqual('テスト選択肢: 無選択')
      })
    })

    describe('選択肢が2番目から3番目に変わった場合', (): void => {
      it('テキストの確認', async () => {
        const wrapper: VueWrapper = factoryWrap({ modelValue: 'val1' })
        await expect(wrapper.text()).toEqual('テスト選択肢: 選択肢1')
        await wrapper.setProps({ modelValue: 'val2' })
        await expect(wrapper.text()).toEqual('テスト選択肢: 選択肢2')
      })
    })
  })

  describe('emitsの確認', (): void => {
    it('選択されるとupdate:model-valueが発火されること', async (): Promise<void> => {
      const wrapper: VueWrapper = factoryWrap({ modelValue: '' })
      const select = wrapper.findComponent({ name: 'v-select' })
      await select.vm.select({ value: 'val1' })
      await expect(wrapper.emitted('update:model-value')).toEqual([['val1']])
      // 選択肢はまだ変わらない
      await expect(wrapper.text()).toEqual('テスト選択肢: 無選択')
    })
  })
})

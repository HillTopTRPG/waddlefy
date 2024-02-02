import { createSimpleClassTest, factory, SimpleClassTestInfo } from '@/components/common'
import UrlForm from '@/components/panes/Nechronica/component/UrlForm.vue'
import { VueWrapper } from '@vue/test-utils'

interface UrlFormProps {
  url: string
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    inputUrl: string
  }
}

function factoryWrap(props?: Partial<UrlFormProps>) {
  const propsWrap: UrlFormProps = {
    url: '',
    ...(props || {})
  }
  return factory(UrlForm, propsWrap)
}

describe('UrlForm.vue', (): void => {
  describe('コンテンツの確認', (): void => {
    it('テキストの確認', () => {
      const wrapper: VueWrapper = factoryWrap()
      expect(wrapper.text()).toContain('Nechronica.label.character-vault-url')
      wrapper.unmount()
    })
  })

  describe('emitsの確認', (): void => {
    it('入力でupdate:urlが発火されること', async () => {
      const wrapper: VueWrapper = factoryWrap()
      const afterUrl: string = 'https://hogehoge.com'
      wrapper.vm.inputUrl = afterUrl
      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('update:url')).toEqual([[afterUrl]])
      wrapper.unmount()
    })
  })

  describe('classの確認', (): void => {
    const patterns: SimpleClassTestInfo[] = [
      { title: 'densityがdefaultであること', selector: '.v-text-field', containClass: 'v-input--density-default' },
      { title: 'variantがsolo-filledであること', selector: '.v-field', containClass: 'v-field--variant-solo-filled' }
    ]
    patterns.forEach(createSimpleClassTest.bind(null, factoryWrap))
  })
})

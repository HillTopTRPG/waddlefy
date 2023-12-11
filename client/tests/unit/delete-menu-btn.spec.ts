import DeleteMenuBtn from '@/components/DeleteMenuBtn.vue'
import { VueWrapper } from '@vue/test-utils'
import { createSimpleClassTest, factory, SimpleClassTestInfo } from '../common'

interface DeleteMenuBtnProps {
  type: string
  targetName: string
  classText?: string
  color?: string
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    opened: boolean
    deleteExecute: () => Promise<void>
    inputTargetName: string
  }
}

function factoryWrap(partialProps: Partial<DeleteMenuBtnProps>) {
  const props: DeleteMenuBtnProps = {
    type: '種別',
    targetName: '削除対象の名前',
    classText: 'additional-class',
    ...partialProps
  }
  return factory(DeleteMenuBtn, props)
}

describe('DeleteMenuBtn.vue', (): void => {
  describe('ボタンの確認', (): void => {
    describe('コンテンツの確認', (): void => {
      let wrapper: VueWrapper
      beforeEach(() => (wrapper = factoryWrap({})))
      afterEach(() => wrapper.unmount())

      it('スナップショットテスト', () => expect(wrapper.element).toMatchSnapshot())
      it('テキストの確認', () => expect(wrapper.text()).toEqual('この種別を削除'))
    })

    describe('classの確認', (): void => {
      describe('color無指定', (): void => {
        const patterns: SimpleClassTestInfo[] = [
          { title: 'colorがerrorであること', selector: '.v-btn', containClass: 'text-error' },
          { title: 'decsityがdefaultであること', selector: '.v-btn', containClass: 'v-btn--density-default' },
          { title: 'variantがtextであること', selector: '.v-btn', containClass: 'v-btn--variant-text' },
          { title: 'sizeがdefaultであること', selector: '.v-btn', containClass: 'v-btn--size-default' },
          { title: 'iconがmdi-delete-outlineであること', selector: '.v-icon', containClass: 'mdi-delete-outline' },
          { title: '追加classが適用されていること', selector: '.v-btn', containClass: 'additional-class' },
          {
            title: 'テキストに下線がついていること',
            selector: '[data-cy=text]',
            containClass: 'text-decoration-underline'
          }
        ]
        patterns.forEach(createSimpleClassTest.bind(null, factoryWrap.bind(null, {})))
      })

      describe('colorをwarningに指定する', (): void => {
        const patterns: SimpleClassTestInfo[] = [
          { title: 'colorがwarningであること', selector: '.v-btn', containClass: 'text-warning' }
        ]
        patterns.forEach(createSimpleClassTest.bind(null, factoryWrap.bind(null, { color: 'warning' })))
      })
    })
  })

  describe('初期状態の確認', (): void => {
    let wrapper: VueWrapper
    beforeEach(() => (wrapper = factoryWrap({})))
    afterEach(() => wrapper.unmount())

    it('openedがfalseであること', (): void => expect(wrapper.vm.opened).toBe(false))
    it('inputTargetNameが空文字であること', (): void => expect(wrapper.vm.inputTargetName).toBe(''))
  })

  describe('deleteExecuteメソッドの確認', (): void => {
    let wrapper: VueWrapper
    beforeEach(() => (wrapper = factoryWrap({})))
    afterEach(() => wrapper.unmount())

    it('実行時にopenedがfalseになること', async (): Promise<void> => {
      wrapper.vm.opened = true
      await wrapper.vm.deleteExecute()
      expect(wrapper.vm.opened).toBe(false)
    })

    it('実行時にexecuteイベントがemitされること', async (): Promise<void> => {
      await wrapper.vm.deleteExecute()
      expect(wrapper.emitted()).toHaveProperty('execute')
    })

    it('実行時にinputTargetNameが空になること', async (): Promise<void> => {
      wrapper.vm.inputTargetName = 'test'
      await wrapper.vm.deleteExecute()
      expect(wrapper.vm.inputTargetName).toBe('')
    })
  })
})

import { shallowMount } from '@vue/test-utils'
import HeikiBtn from '../../src/components/panes/Nechronica/component/HeikiBtn'

describe('HeikiBtn.vue', () => {
  it('コンテンツ確認', () => {
    const wrapper = shallowMount(HeikiBtn, {
      props: { ignoreHeiki: true }
    })
    expect(wrapper.text()).toMatch('平気')
  })
})

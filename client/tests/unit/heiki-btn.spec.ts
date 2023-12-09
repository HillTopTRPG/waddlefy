import {mount, VueWrapper} from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import HeikiBtn from '@/components/panes/Nechronica/component/HeikiBtn.vue'

const vuetify = createVuetify({
  components,
  directives,
})

function factory(props: { ignoreHeiki: boolean }): VueWrapper {
  return mount(HeikiBtn, {
    props,
    global: {
      plugins: [vuetify],
    }
  })
}

describe('HeikiBtn.vue', (): void => {
  it('コンテンツの確認', (): void => {
    const wrapper: VueWrapper = factory({
      ignoreHeiki: true
    })

    // Assert the rendered text of the component
    expect(wrapper.text()).toContain('平気')
  })
})

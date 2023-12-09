import { mount, VueWrapper } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives
})

export function factory<T extends any>(component: any, props?: T): VueWrapper {
  return mount(component, {
    props: props || undefined,
    global: {
      plugins: [vuetify]
    }
  })
}

export interface SimpleClassTestInfo {
  title: string
  selector: string
  not?: boolean
  containClass: string
}

export function createSimpleClassTest(
  wrapper: VueWrapper,
  { title, selector, containClass, not }: SimpleClassTestInfo
) {
  it(title, () => {
    const expectObj = expect(wrapper.find(selector).classes())
    if (not) {
      expectObj.not.toContain(containClass)
    } else {
      expectObj.toContain(containClass)
    }
  })
}

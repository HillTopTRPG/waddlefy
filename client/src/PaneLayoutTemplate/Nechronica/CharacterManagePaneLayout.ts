import { Layout } from '@/components/panes'
import { uuid } from 'vue-uuid'

const object: Layout = {
  type: 'vertical',
  uuid: uuid.v4(),
  payload: null,
  panes: [
    {
      type: 'normal',
      uuid: uuid.v4(),
      componentGroup: 'ネクロニカ',
      component: 'キャラクター管理',
      payload: null,
      panes: []
    }
  ]
}

export default object

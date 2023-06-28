import ChatLayout from '@/PaneLayoutTemplate/ChatLayout'
import DefaultLayout from '@/PaneLayoutTemplate/DefaultLayout'

export default [
  {
    layout: DefaultLayout,
    title : '空のペインのみ',
  }, {
    layout: ChatLayout,
    title : 'チャット＋空のペイン',
  },
]

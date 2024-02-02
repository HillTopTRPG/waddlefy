import {Preview, setup} from '@storybook/vue3'
import {registerPlugins} from '../src/plugins'
import {withVuetifyTheme} from './withVuetifyTheme.decorator'

setup((app) => {
  registerPlugins(app);
});

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  },
  decorators: [withVuetifyTheme]
}

export default preview

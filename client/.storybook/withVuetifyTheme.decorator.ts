import { VApp } from "vuetify/components";
import { Decorator } from "@storybook/vue3";

export const withVuetifyTheme: Decorator = (story, context) => {
  return {
    components: { story, VApp },
    // それぞれのstoryをv-appタグでラップ
    template: `
      <v-sheet>
        <story/>
      </v-sheet>
    `,
  };
};

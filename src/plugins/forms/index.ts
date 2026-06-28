import type { KapiPlugin } from "../../core/plugins/types";

const formsPlugin: KapiPlugin = {
  name: "kapilabs-plugin-forms",
  label: "Forms",
  version: "1.0.0",
  description: "Form rendering enhancements and submission handling",

  register(_ctx) {
    // Forms plugin placeholder — ready for future extensions
    // such as submit hooks, spam protection, and storage backends.
  },
};

export default formsPlugin;

import type { KapiPlugin } from "../../core/plugins/types";

const blogPlugin: KapiPlugin = {
  name: "kapilabs-plugin-blog",
  label: "Blog",
  version: "1.0.0",
  description: "Blog templates, archives, and category/tag page registration",

  register(_ctx) {
    // Blog plugin placeholder — ready for future extensions
    // such as auto-registering archive routes and feed generation.
  },
};

export default blogPlugin;

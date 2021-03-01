import path from "path";
import { existsSync } from "fs";
import glob from "fast-glob";

import type { Plugin, Fwoosh } from "../fwoosh";

export default class UserLayoutsPlugin implements Plugin {
  name = "user-layouts";

  apply(fwoosh: Fwoosh) {
    fwoosh.hooks.registerLayouts.tapPromise(this.name, async (layouts) => {
      const userLayoutsDir = path.join(fwoosh.options.dir, "layouts");

      if (existsSync(userLayoutsDir)) {
        const userLayouts = await glob(
          path.join(userLayoutsDir, "**/*.{jsx,tsx}")
        );

        userLayouts.forEach((layout) => {
          layouts.push({
            path: path.resolve(layout),
            name: path.parse(layout).name,
          });
        });
      }

      return layouts;
    });
  }
}

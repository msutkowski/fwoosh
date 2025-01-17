import { performance } from "perf_hooks";
import { app, MultiCommand, Option } from "command-line-application";
import ms from "pretty-ms";
import ora from "ora";
import path from "path";
import { lilconfig } from "lilconfig";
import { register } from "ts-node";

import { FwooshOptionWithCLIDefaults } from "@fwoosh/types";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const loadEsm = (filepath: string) => {
  return import(filepath);
};

const loadTypescript = () => {
  const tsNodeInstance = register({
    transpileOnly: true,
  });

  return async (filepath: string, content: string) => {
    try {
      tsNodeInstance.compile(content, filepath);
      return require(filepath);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };
};

const name = "fwoosh";
const explorer = lilconfig(name, {
  searchPlaces: [`${name}.config.ts`, `${name}.config.mjs`],
  loaders: {
    ".mjs": loadEsm,
    ".ts": loadTypescript(),
  },
});

const storiesOption: Option = {
  name: "stories",
  description: "Globs to match story files",
  type: String,
  defaultOption: true,
  multiple: true,
  defaultValue: "**/*.stories.@(js|jsx|ts|tsx|mdx)",
};

const outDirOption: Option = {
  name: "out-dir",
  description: "The directory that the built website should ",
  type: String,
  defaultValue: "./out",
};

const openOption: Option = {
  name: "open",
  type: String,
  description: "Open the browser to the dev server",
  defaultValue: false,
  typeLabel: "workbench | docs",
};

const sharedOptions: Option[] = [
  {
    name: "log-level",
    description: "The amount of logs to print",
    type: String,
    defaultValue: "log",
    typeLabel: "log | info | debug | trace",
  },
];

const fwooshCli: MultiCommand = {
  name,
  description: "A lightening quick component development",
  commands: [
    {
      name: "dev",
      description: "Start the development server",
      options: [...sharedOptions, storiesOption, openOption],
    },
    {
      name: "build",
      description: "Do a production build of the website",
      options: [...sharedOptions, storiesOption, outDirOption],
    },
    {
      name: "serve",
      description: "Run a server for the production build of the website",
      options: [openOption],
    },
    {
      name: "clean",
      description: "Clean up all the output files",
      options: sharedOptions,
    },
  ],
};

async function run() {
  const start = performance.now();
  const options = app(fwooshCli);
  const { config = {}, filepath } = (await explorer.search()) || {};
  const dir = path.dirname(filepath || process.cwd());

  if (options) {
    delete options._none;
    delete options._all;
  }

  const fwooshOptions = {
    ...options,
    open:
      options?.open === "workbench" || options?.open === null
        ? "workbench"
        : options?.open === "docs"
        ? "docs"
        : false,
    ...(config.config || config.default),
  } as FwooshOptionWithCLIDefaults;

  if (config.stories) {
    fwooshOptions.stories = config.stories;
  }

  if (options?.logLevel) {
    process.env.LOG_LEVEL = options.logLevel;
  }

  // Dynamic import so we can set env vars before loading
  const { Fwoosh } = await import("./fwoosh.js");
  const fwoosh = new Fwoosh(fwooshOptions);
  const outDir = path.join(dir, "out");

  await fwoosh.loadPlugins();

  if (options) {
    if (options._command === "build") {
      await fwoosh.clean();
      await fwoosh.build({ outDir });
    } else if (options._command === "clean") {
      await fwoosh.clean();
      ora("").succeed("Cleaned output files.");
    } else if (options._command === "serve") {
      await fwoosh.serve({ outDir });
    } else {
      await fwoosh.dev();
    }
  }

  const { log } = await import("@fwoosh/utils");
  const end = performance.now();
  log.info(`Dev server start up took: ${ms(end - start)}`);
}

run();

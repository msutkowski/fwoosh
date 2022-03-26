import { app } from "command-line-application";
import ms from "pretty-ms";
import ora from "ora";
import { cosmiconfig } from "cosmiconfig";
import { Fwoosh } from "./fwoosh.js";
const name = "fwoosh";
const explorer = cosmiconfig(name, {
    searchPlaces: [
        "package.json",
        `.${name}rc`,
        `.${name}rc.json`,
        `.${name}rc.yaml`,
        `.${name}rc.yml`,
        `.${name}rc.js`,
        `.${name}rc.cjs`,
        `${name}.config.js`,
        `${name}.config.json`,
        `${name}.config.cjs`,
    ],
});
const storiesOption = {
    name: "stories",
    description: "Globs to match story files",
    type: String,
    defaultOption: true,
    multiple: true,
    defaultValue: "**/*.stories.{js,jsx,tsx}",
};
const sharedOptions = [
    storiesOption,
    {
        name: "out-dir",
        description: "The directory that the built website should ",
        type: String,
        defaultValue: "./out",
    },
];
const fwooshCli = {
    name,
    description: "A lightening quick component development",
    commands: [
        {
            name: "build",
            description: "Do a production build of the website",
            options: sharedOptions,
        },
        {
            name: "dev",
            description: "Start the development server",
            options: sharedOptions,
        },
        {
            name: "clean",
            description: "Clean up all the output files",
            options: sharedOptions,
        },
    ],
};
async function run() {
    const start = process.hrtime();
    const options = app(fwooshCli);
    const { config = {} } = (await explorer.search()) || {};
    const fwooshOptions = { ...config, ...options };
    if (config.stories) {
        fwooshOptions.stories = config.stories;
    }
    const fwoosh = new Fwoosh(fwooshOptions);
    await fwoosh.loadPlugins();
    if (options) {
        if (options._command === "build") {
            await fwoosh.clean();
            await fwoosh.build();
        }
        else if (options._command === "clean") {
            await fwoosh.clean();
            ora("").succeed("Cleaned output files.");
        }
        else {
            await fwoosh.dev();
        }
    }
    const end = process.hrtime(start);
    console.info(`\n🔥 Took ${ms(end[1] / 1000000)}`);
}
run();

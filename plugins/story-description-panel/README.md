# `@fwoosh/story-description-panel`

Display your story's jsDoc description as a panel in the storybook.

## Installation

To use this plugin first install the package:

```sh
npm i --save-dev @fwoosh/story-description-panel
# or
yarn add -D @fwoosh/story-description-panel
```

Then add it to your `fwoosh.config.ts`:

```ts
export const config: FwooshConfig = {
  plugins: ["@fwoosh/story-description-panel"],
};
```
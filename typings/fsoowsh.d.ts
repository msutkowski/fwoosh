declare module "@fwoosh/app/stories" {
  import { Stories } from "@fwoosh/types";
  export const stories: Stories;
}

declare module "@fwoosh/app/config" {
  // import { FwooshOptions } from "fwoosh";
  export const config: Pick<FwooshOptions, "title">;
}

declare module "@fwoosh/app/render" {
  export function render(id: Element, slug: string): void;
}

declare module "@fwoosh/app/docs" {
  import type { ComponentDoc } from "react-docgen-typescript";
  // import { StoryMeta } from "fwoosh";
  export function useDocs(key: string, story: StoryMeta): ComponentDoc[];
}

declare module "@fwoosh/app/ui" {
  interface ToolbarPlugin {
    ({ storyPreviewId: string }): JSX.Element;
    componentName: string;
    displayName: string;
  }
  interface PanelPlugin {
    ({ storyPreviewId: string }): JSX.Element;
    componentName: string;
    displayName: () => JSX.Element;
  }

  export const toolbarControls: Array<ToolbarPlugin>;
  export const panels: Array<PanelPlugin>;

  import { BasicStoryData, MDXStoryData } from "@fwoosh/app/stories";

  interface BaseTreeItem {
    id: string;
    name: string;
  }

  export interface StoryTreeItem extends BaseTreeItem {
    type: "story";
    story: BasicStoryData;
  }

  export interface MDXPageTreeItem extends BaseTreeItem {
    type: "mdx";
    story: MDXStoryData;
  }

  export type StorySidebarChildItem =
    | StoryTree
    | StoryTreeItem
    | MDXPageTreeItem;

  export interface StoryTree extends BaseTreeItem {
    type: "tree";
    children: StorySidebarChildItem[];
  }

  export type StorySidebarItem = StoryTree | MDXPageTreeItem;
}

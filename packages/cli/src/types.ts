import { AsyncSeriesBailHook, SyncBailHook } from "tapable";
import type { Stories } from "@fwoosh/app/stories";

export interface StoryMeta {
  /** The title used to create the sidebar tree structure. */
  title: string;
}

export interface Story {
  exportName: string;
  title: string;
  slug: string;
  file: string;
}

interface RenderStoryContext {
  slug: string;
  stories: Stories;
}

export interface FwooshHooks {
  renderStory: SyncBailHook<void, string>;
}

export interface FwooshOptions {
  /** Globs to match story files */
  stories: string[];
  /** the directory with the mdx pages */
  outDir: string;
  /** Plugins applied to this fwoosh instance, contains default plugins */
  plugins: Array<string | [name: string, options: Record<string, unknown>]>;
}
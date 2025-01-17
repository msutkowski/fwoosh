import * as React from "react";
import { StoryMeta as BaseStoryMeta, StoryParameters } from "@fwoosh/types";

type Component = React.FunctionComponent<any> | React.ClassicComponent<any>;
export type Decorator = (
  story: () => JSX.Element,
  slug: string,
  params: StoryParameters
) => () => JSX.Element;

export interface Story<P extends StoryParameters = StoryParameters> {
  (): JSX.Element;
  /** The component(s) docs should be generated for */
  component?: Component | Component[];
  /** Decorators the render around the story */
  decorators?: Decorator[];
  /** Parameters for addons rendered with the story */
  parameters?: P;
}

export interface StoryMeta<P extends StoryParameters = StoryParameters>
  extends BaseStoryMeta<P> {
  /** The component docs should be generated for */
  component?: React.ComponentType<any> | React.ComponentType<any>[];
  /** Decorators the render around all of the stories associated with this meta */
  decorators?: Decorator[];
}

import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import { StoryData, StoryParameters } from "@fwoosh/types";
import { stories } from "@fwoosh/app/stories";
import { Spinner, ErrorBoundary, Tooltip } from "@fwoosh/components";
import type { Decorator, Story as ReactStory, StoryMeta } from "./types";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

function reverse<T>(arr: T[]) {
  return arr.slice().reverse();
}

function useDecorators(story: StoryData) {
  const [decorators, setDecorators] =
    React.useState<ReactStory<any>["decorators"]>();

  React.useLayoutEffect(() => {
    async function getDecorators() {
      const [meta, storyComponentImport] = await Promise.all([
        story.meta,
        story.component._payload._result,
      ]);
      const storyComponent =
        storyComponentImport.default || storyComponentImport;

      setDecorators([
        ...reverse<Decorator>(storyComponent.decorators || []),
        ...reverse<Decorator>((meta as StoryMeta<any>).decorators || []),
        ...reverse<Decorator>((window as any).__FWOOSH_DECORATORS__ || []),
      ]);
    }

    getDecorators();
  }, [story]);

  return decorators;
}

interface AppProps {
  slug: string;
  params: StoryParameters;
}

function App({ slug, params }: AppProps) {
  const story = stories[slug];
  const decorators = useDecorators(story);

  let content = story.component;

  if (decorators?.length) {
    for (const decorator of decorators) {
      content = decorator(content, slug, params);
    }
  }

  const Component = content;

  return <Component />;
}

export function render(
  el: Element,
  slug: string,
  params: StoryParameters,
  onStart: () => void,
  onComplete: () => void
) {
  if (!el) {
    return;
  }

  function Fallback() {
    React.useEffect(() => {
      onStart();
    });
    return <Spinner delay={300} />;
  }

  function OnStart() {
    React.useEffect(() => {
      onComplete();
    });
    return <></>;
  }

  try {
    ReactDOM.render(
      <TooltipPrimitive.Provider>
        <Suspense fallback={<Fallback />}>
          <ErrorBoundary>
            <App slug={slug} params={params} />
          </ErrorBoundary>
          <OnStart />
        </Suspense>
      </TooltipPrimitive.Provider>,
      el
    );
  } catch (e) {
    console.error("error", e);
  }
}

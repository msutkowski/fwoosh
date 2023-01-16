import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import { StoryData } from "@fwoosh/types";
import { stories } from "@fwoosh/app/stories";
import { Spinner, ErrorBoundary } from "@fwoosh/components";
import type { Story as ReactStory, StoryMeta } from "./types";

function useDecorators(story: StoryData) {
  const [decorators, setDecorators] = React.useState<
    ReactStory<any>["decorators"]
  >();

  React.useLayoutEffect(() => {
    async function getDecorators() {
      const [meta, storyComponentImport] = await Promise.all([
        story.meta,
        story.component._payload._result,
      ]);
      const storyComponent =
        storyComponentImport.default || storyComponentImport;

      setDecorators([
        ...(storyComponent.decorators || []).reverse(),
        ...((meta as StoryMeta<any>).decorators || []).reverse(),
        ...((window as any).__FWOOSH_DECORATORS__ || []).reverse(),
      ]);
    }

    getDecorators();
  }, [story]);

  return decorators;
}

interface AppProps {
  slug: string;
}

function App({ slug }: AppProps) {
  const story = stories[slug];
  const decorators = useDecorators(story);

  let content: JSX.Element | null = null;

  if (decorators?.length) {
    for (const decorator of decorators) {
      content = decorator(story.component);
    }
  } else {
    const Component = story.component;
    content = <Component />;
  }

  return content;
}

export function render(
  el: Element,
  slug: string,
  onStart: () => void,
  onComplete: () => void
) {
  if (!el) {
    return;
  }

  function Fallback() {
    React.useEffect(() => {
      onStart();
      return () => {
        onComplete();
      };
    });
    return <Spinner delay={300} />;
  }

  try {
    ReactDOM.render(
      <Suspense fallback={<Fallback />}>
        <ErrorBoundary>
          <App slug={slug} />
        </ErrorBoundary>
      </Suspense>,
      el
    );
  } catch (e) {
    console.error("error", e);
  }
}

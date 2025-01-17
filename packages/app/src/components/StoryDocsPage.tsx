import React, { Suspense } from "react";
import { useId } from "@radix-ui/react-id";
import { BasicStoryData, StoryMeta } from "@fwoosh/types";
import { useDocgen } from "@fwoosh/app/docs";
import { styled } from "@fwoosh/styling";
import {
  components,
  PageWrapper,
  Spinner,
  PropsTable,
  QuickNav,
  DocsLayout,
  MDXContent,
} from "@fwoosh/components";
import * as Collapsible from "@radix-ui/react-collapsible";
import { capitalCase, paramCase } from "change-case";
import { titleCase } from "title-case";
import { StorySidebarChildItem } from "@fwoosh/types";
import { useHighlightedCode } from "@fwoosh/hooks";

import { useRender } from "../hooks/useRender";
import { PageSwitchButton } from "./PageSwitchButtons";
import { useActiveHeader } from "../hooks/useActiveHeader";

const HeaderWrapper = styled("div", {
  position: "relative",
});

const CollapsibleContent = styled(Collapsible.Content, {
  "& pre": {
    margin: 0,
  },
});

const HeaderLink = ({ title, id }: { title: React.ReactNode; id: string }) => {
  return (
    <a data-link-icon href={`#${id}`} tabIndex={-1}>
      <span className="visually-hidden">Link to the {title} section</span>
    </a>
  );
};

const StoryPreview = styled("div", {
  borderWidth: "$sm",
  borderStyle: "$solid",
  borderColor: "$gray7",
  px: 4,
  py: 8,
  borderRadius: "$round",
  overflow: "auto",

  variants: {
    state: {
      open: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderBottom: "none",
      },
    },
  },
});

const ShowCodeButton = styled("button", {
  px: 2,
  position: "absolute",
  bottom: 0,
  right: 0,
  borderTopWidth: "$sm",
  borderTopStyle: "$solid",
  borderLeftWidth: "$sm",
  borderLeftStyle: "$solid",
  borderColor: "$gray7",
  borderTopLeftRadius: "$round",
  color: "$gray10",
  zIndex: 100,
});

const CollapsibleRoot = styled(Collapsible.Root, {
  position: "relative",
  mt: 8,
  mb: 12,

  "& .ch-codeblock": {
    margin: 0,
  },

  "&[data-state='open'] :is(.ch-codeblock,.ch-code)": {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
});

const StoryCode = React.memo(({ code }: { code: string }) => {
  const highlightedCode = useHighlightedCode({ code });

  if (!highlightedCode) {
    return null;
  }

  return <MDXContent compiledSource={highlightedCode} />;
});

const OverlaySpinner = styled("div", {
  background: "$gray1",
  position: "absolute",
  inset: 0,
  zIndex: 100000,
});

const StoryDiv = React.memo(
  ({
    slug,
    code,
    showSpinnerWhileLoading,
  }: {
    slug: string;
    code: string;
    showSpinnerWhileLoading?: boolean;
  }) => {
    const id = useId();
    const [codeShowing, codeShowingSet] = React.useState(false);
    const { ref, hasRendered } = useRender({ id, slug });

    return (
      <>
        <CollapsibleRoot open={codeShowing} onOpenChange={codeShowingSet}>
          <StoryPreview state={codeShowing ? "open" : undefined} ref={ref} />
          <Collapsible.Trigger asChild={true}>
            <ShowCodeButton>
              {codeShowing ? "Hide" : "Show"} code
            </ShowCodeButton>
          </Collapsible.Trigger>
          <CollapsibleContent>
            <Suspense fallback={<Spinner delay={2000} />}>
              <StoryCode code={code} />
            </Suspense>
          </CollapsibleContent>
        </CollapsibleRoot>
        {showSpinnerWhileLoading && !hasRendered && (
          <OverlaySpinner>
            <Spinner delay={2000} />
          </OverlaySpinner>
        )}
      </>
    );
  }
);

const DocsPropsTable = ({
  story,
  meta,
  hasTitle,
}: {
  story: BasicStoryData;
  meta: StoryMeta;
  hasTitle?: boolean | string;
}) => {
  const docs = useDocgen(story.slug, meta);

  return (
    <div style={{ height: "fit-content" }}>
      <PropsTable docs={docs} hasTitle={hasTitle} />
    </div>
  );
};

interface PageContentProps {
  stories: StorySidebarChildItem[];
}

export const PageContent = ({
  stories: [firstStory, ...stories],
}: PageContentProps) => {
  let docsIntro: React.ReactNode = null;

  if (
    firstStory &&
    firstStory.type === "story" &&
    firstStory.story.type === "basic"
  ) {
    const introProps = (
      <DocsPropsTable
        story={firstStory.story}
        meta={firstStory.story.meta}
        hasTitle="props"
      />
    );

    docsIntro = (
      <>
        {firstStory.story.comment && (
          <MDXContent compiledSource={firstStory.story.comment} />
        )}
        <StoryDiv
          slug={firstStory.story.slug}
          code={firstStory.story.code}
          key={firstStory.story.slug}
          showSpinnerWhileLoading={true}
        />
        {process.env.NODE_ENV === "production" ? (
          // In prod we want the whole page to render before showing so it jumps less
          // since all the data is already inlined though should be fast.
          introProps
        ) : (
          <Suspense fallback={<Spinner style={{ height: 200 }} />}>
            {introProps}
          </Suspense>
        )}
      </>
    );
  }

  return (
    <>
      {docsIntro}
      {stories.length > 0 && (
        <>
          <HeaderWrapper data-link-group>
            <HeaderLink id="stories" title="Stories" />
            <components.h2 id="stories">Stories</components.h2>
          </HeaderWrapper>
          {stories.map((story) => {
            if (story.type === "tree" || story.story.type === "mdx") {
              return null;
            }

            return (
              <div key={story.story.slug}>
                <HeaderWrapper data-link-group>
                  <HeaderLink
                    id={paramCase(story.story.title)}
                    title={story.story.title}
                  />
                  <components.h3 id={paramCase(story.story.title)}>
                    {story.story.title}
                  </components.h3>
                </HeaderWrapper>
                {story.story.comment && (
                  <MDXContent compiledSource={story.story.comment} />
                )}
                <StoryDiv slug={story.story.slug} code={story.story.code} />
                <Suspense
                  fallback={<Spinner style={{ height: 200 }} delay={2000} />}
                >
                  <DocsPropsTable
                    story={story.story}
                    meta={story.story?.component?._payload?._result}
                    hasTitle={true}
                  />
                </Suspense>
              </div>
            );
          })}
        </>
      )}
    </>
  );
};

export const StoryDocsPageContent = ({
  name,
  stories: [firstStory, ...stories],
  children,
}: PageContentProps & { name: string; children?: React.ReactNode }) => {
  const quickNavRef = React.useRef<HTMLDivElement>(null);

  useActiveHeader(quickNavRef);

  return (
    <PageWrapper style={{ position: "relative" }}>
      <div>
        <components.h1 id="intro">{titleCase(name)}</components.h1>
        <PageContent stories={[firstStory, ...stories]} />
      </div>
      {children}
    </PageWrapper>
  );
};

export const StoryDocsPage = ({
  name,
  stories: [firstStory, ...stories],
}: PageContentProps & { name: string }) => {
  const quickNavRef = React.useRef<HTMLDivElement>(null);

  useActiveHeader(quickNavRef);

  return (
    <DocsLayout>
      <StoryDocsPageContent name={name} stories={[firstStory, ...stories]}>
        <PageSwitchButton current={firstStory.id} />
      </StoryDocsPageContent>
      <QuickNav.Root ref={quickNavRef}>
        <QuickNav.Header>
          <QuickNav.Title>Quick nav</QuickNav.Title>
        </QuickNav.Header>
        <ol>
          <QuickNav.Item>
            <QuickNav.Link href="#intro">Introduction</QuickNav.Link>
          </QuickNav.Item>
          <QuickNav.Item>
            <QuickNav.Link href="#props">Properties</QuickNav.Link>
          </QuickNav.Item>

          {stories.length > 0 && (
            <>
              <QuickNav.Item>
                <QuickNav.Link href="#stories">Stories</QuickNav.Link>
              </QuickNav.Item>
              <QuickNav.Group>
                {stories.map((story) => {
                  if (story.type === "tree" || story.story.type === "mdx") {
                    return null;
                  }

                  const hash = `#${paramCase(story.story.title)}`;

                  return (
                    <QuickNav.Item key={hash}>
                      <QuickNav.Link href={hash}>
                        {capitalCase(story.story.title)}
                      </QuickNav.Link>
                    </QuickNav.Item>
                  );
                })}
              </QuickNav.Group>
            </>
          )}
        </ol>
      </QuickNav.Root>
    </DocsLayout>
  );
};

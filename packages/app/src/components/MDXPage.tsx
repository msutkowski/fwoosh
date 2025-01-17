import React from "react";
import {
  components,
  DocsLayout,
  PageWrapper,
  QuickNav,
} from "@fwoosh/components";
import { stories } from "@fwoosh/app/stories";
import { MDXStoryData, StoryTreeItem, TocEntry } from "@fwoosh/types";
import { MDXProvider } from "@mdx-js/react";
import { useQuery } from "react-query";
import { PageSwitchButton } from "./PageSwitchButtons";
import { useActiveHeader } from "../hooks/useActiveHeader";
import { useLocation } from "react-router-dom";
import {
  buildSearchIndex,
  SearchData,
  CONTENT_ID,
  HEADING_SELECTOR,
} from "@fwoosh/utils";

function TableOfContentsGroup({ entry }: { entry: TocEntry }) {
  return (
    <>
      <QuickNav.Item>
        <QuickNav.Link href={`#${entry.attributes.id}`}>
          {entry.value}
        </QuickNav.Link>
      </QuickNav.Item>
      {entry.children.length > 0 && (
        <QuickNav.Group>
          {entry.children.map((item) => (
            <TableOfContentsGroup key={item.value + item.depth} entry={item} />
          ))}
        </QuickNav.Group>
      )}
    </>
  );
}

function getTocFromNav(el: HTMLElement, level: number) {
  const items = Array.from(
    el.querySelectorAll<HTMLElement>(`.toc-level-${level} > .toc-item`)
  );

  return items.map((item) => {
    const anchor = item.querySelector<HTMLAnchorElement>(
      "a"
    ) as HTMLAnchorElement;
    const href = anchor.getAttribute("href");
    let id = "";

    if (href) {
      const hrefUrl = new URL(href, window.location.href);
      id = hrefUrl.hash.replace("#", "");
    }

    const entry: TocEntry = {
      value: anchor.text,
      attributes: {
        id: id,
      },
      children: getTocFromNav(item, level + 1),
      depth: level,
    };

    return entry;
  });
}

function TableOfContents() {
  const quickNavRef = React.useRef<HTMLDivElement>(null);
  const [toc, setToc] = React.useState<TocEntry[]>([]);
  const location = useLocation();

  useActiveHeader(quickNavRef);

  React.useEffect(() => {
    const main = document.querySelector<HTMLElement>("main");

    if (!main) {
      return;
    }

    function getTocs(el: HTMLElement) {
      const navs = Array.from(el.querySelectorAll<HTMLElement>("nav.toc"));

      for (const nav of navs) {
        const toc = getTocFromNav(nav, 1);

        if (toc.length) {
          setToc(toc);
          break;
        }
      }
    }

    const mutationObserver = new MutationObserver((entries) => {
      getTocs(entries[0].target as HTMLElement);
    });

    mutationObserver.observe(main, { childList: true, subtree: true });

    getTocs(main);

    return () => {
      mutationObserver.disconnect();
    };
  }, [location]);

  if (!toc.length) {
    return null;
  }

  return (
    <QuickNav.Root ref={quickNavRef}>
      <QuickNav.Header>
        <QuickNav.Title>Quick nav</QuickNav.Title>
      </QuickNav.Header>
      {toc.map((item) => (
        <TableOfContentsGroup key={item.value + item.depth} entry={item} />
      ))}
    </QuickNav.Root>
  );
}

type MDXComponents = React.ComponentProps<typeof MDXProvider>["components"];

declare global {
  interface Window {
    FWOOSH_SEARCH_INDEX: Record<string, SearchData[]>;
  }
}

export const MDXPage = ({ page }: { page: StoryTreeItem }) => {
  const location = useLocation();
  const { component: MDXPage, meta, slug } = stories[page.id] as MDXStoryData;
  // TODO
  const { data } = useQuery(`toc-${page.id}`, () => []);

  React.useEffect(() => {
    const [lvl0, ...rest] = meta.title.split("/");
    // The leaf story name we don't care about. Instead we'll use
    // the H1 from the MDX page.
    rest.pop();
    let lvl1 = rest.join(" / ");

    const headingNodes = document
      ?.getElementById(CONTENT_ID)
      ?.querySelectorAll<HTMLHeadingElement>(HEADING_SELECTOR);

    if (!headingNodes) {
      return;
    }

    const headings = Array.from(headingNodes);
    const levels = [lvl0];

    if (lvl1) {
      levels.push(lvl1);
    }

    if (!window.FWOOSH_SEARCH_INDEX) {
      window.FWOOSH_SEARCH_INDEX = {};
    }

    window.FWOOSH_SEARCH_INDEX[slug] =
      headings.length > 0 ? buildSearchIndex(levels, headings[0]) : [];

    if (process.env.NODE_ENV === "production") {
      // This log is used to communicate the search index to the
      // built app.
      console.log(
        "window.FWOOSH_SEARCH_INDEX",
        slug,
        window.FWOOSH_SEARCH_INDEX[slug]
      );
    }
  }, [meta, slug]);

  React.useLayoutEffect(() => {
    location.hash && document.querySelector(location.hash)?.scrollIntoView();
  }, []);

  const hasWrapper =
    !("fullPage" in page.story.meta) || page.story.meta.fullPage !== true;
  let content = <MDXPage />;

  if (hasWrapper) {
    content = (
      <PageWrapper>
        <div>{content}</div>
        <PageSwitchButton current={page.id} />
      </PageWrapper>
    );
  }

  if (data && hasWrapper && !meta.hideNav) {
    content = (
      <DocsLayout>
        {content}
        {data && !meta.hideNav && <TableOfContents />}
      </DocsLayout>
    );
  }

  return (
    <MDXProvider components={components as MDXComponents}>
      {content}
    </MDXProvider>
  );
};

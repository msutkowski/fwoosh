import * as React from "react";
import { NodeRendererProps } from "react-arborist";
import {
  SidebarActiveDot,
  SidebarFolderOpenIndicator,
  SidebarItem,
  SidebarSectionTitle,
  SIDEBAR_ITEM_INDENT,
} from "@fwoosh/components";
import { Link } from "react-router-dom";
import { stories } from "@fwoosh/app/stories";
import { StorySidebarChildItem } from "@fwoosh/types";
import { SidebarFolderOpenIndicatorWrapper } from "@fwoosh/components";
import {
  resetContentScrollPosition,
  convertMetaTitleToUrlParam,
} from "@fwoosh/utils";
import { tree } from "@fwoosh/app/stories";
import { useDocsPath } from "@fwoosh/hooks";
import { titleCase } from "title-case";

import { SidebarTree } from "./SidebarTree";
import { getFirstRenderableChild } from "../../hooks/getFirstRenderableChild";

function Node({ node, style }: NodeRendererProps<StorySidebarChildItem>) {
  const firstChildSlug = getFirstRenderableChild(node, {
    isWorkbench: false,
  });
  const name = titleCase(node.data.name);
  const isValidPath = React.useMemo(() => {
    return Object.values(stories).some(
      (story) => convertMetaTitleToUrlParam(story.grouping) === node.data.id
    );
  }, [node.data.id]);
  const finalStyle = {
    ...style,
    paddingLeft: (style.paddingLeft as number) + SIDEBAR_ITEM_INDENT,
  };

  if (
    (node.data.type === "tree" && node.data.children.length === 0) ||
    (node.data.type === "story" && node.data.story.type === "mdx")
  ) {
    const isActive = node.data.id === node.tree.props.selection;

    return (
      <SidebarItem
        style={finalStyle}
        as={Link}
        to={node.data.id}
        aria-selected={isActive}
        onClick={resetContentScrollPosition}
      >
        <SidebarFolderOpenIndicatorWrapper>
          {isActive && <SidebarActiveDot />}
        </SidebarFolderOpenIndicatorWrapper>
        {name}
      </SidebarItem>
    );
  }

  const isChildActive = node.tree.props.selection?.includes(node.data.id);

  if (isValidPath) {
    return (
      <SidebarItem
        style={finalStyle}
        as={Link}
        to={node.data.id}
        data-active={isChildActive}
        onClick={resetContentScrollPosition}
      >
        <SidebarFolderOpenIndicator
          as="button"
          isOpen={node.isOpen}
          onClick={(e) => {
            node.toggle();
            // Prevent parent link from navigating
            e.preventDefault();
          }}
        />
        {name}
      </SidebarItem>
    );
  }

  return (
    <SidebarSectionTitle
      style={finalStyle}
      data-active={isChildActive}
      as={Link}
      to={firstChildSlug}
    >
      <SidebarFolderOpenIndicator
        as="button"
        isOpen={node.isOpen}
        onClick={(e) => {
          node.toggle();
          // Prevent parent link from navigating
          e.preventDefault();
        }}
      />
      {name}
    </SidebarSectionTitle>
  );
}

function filterOutStories(tree: StorySidebarChildItem[]) {
  const filteredTree: StorySidebarChildItem[] = [];

  for (const item of tree) {
    if (item.type === "story") {
      if (item.story.type === "mdx") {
        filteredTree.push(item);
      }

      continue;
    }

    const filteredChildren = filterOutStories(item.children);
    filteredTree.push({ ...item, children: filteredChildren });
  }

  return filteredTree;
}

export const DocsSidebarTree = () => {
  const docsPath = useDocsPath();

  return (
    <SidebarTree data={filterOutStories(tree)} activeId={docsPath}>
      {Node}
    </SidebarTree>
  );
};

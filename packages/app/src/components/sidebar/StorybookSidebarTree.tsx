import * as React from "react";
import {
  SidebarActiveDot,
  SidebarFolderOpenIndicator,
  SidebarFolderOpenIndicatorWrapper,
  SidebarItem,
  SidebarSectionTitle,
  SIDEBAR_ITEM_INDENT,
} from "@fwoosh/components";
import { Link } from "react-router-dom";
import { StoryTreeItem } from "@fwoosh/types";
import {
  useStoryTree,
  hasActiveChild,
  useStoryId,
  useDocsPath,
} from "@fwoosh/hooks";
import { capitalCase } from "change-case";

import { SidebarTree } from "./SidebarTree";
import { resetContentScrollPosition } from "@fwoosh/utils";
import { getFirstRenderableChild } from "../../hooks/getFirstRenderableChild";

export const StorybookSidebarTree = () => {
  const storyId = useStoryId();
  const docsPath = useDocsPath();
  const tree = useStoryTree();

  return (
    <SidebarTree data={tree} activeId={storyId || docsPath}>
      {({ node, style }) => {
        const finalStyle = {
          ...style,
          paddingLeft: (style.paddingLeft as number) + SIDEBAR_ITEM_INDENT,
        };
        const name = capitalCase(node.data.name);

        if (node.data.type === "story") {
          const slug = ((node.data as unknown) as StoryTreeItem).story.slug;
          const isActive = slug === node.tree.props.selection;

          return (
            <SidebarItem
              key={slug}
              style={finalStyle}
              aria-selected={isActive}
              as={Link}
              to={node.data.story.type === "mdx" ? `docs/${slug}` : slug}
              onClick={resetContentScrollPosition}
            >
              <SidebarFolderOpenIndicatorWrapper>
                {isActive && <SidebarActiveDot />}
              </SidebarFolderOpenIndicatorWrapper>
              {name}
            </SidebarItem>
          );
        }

        const isChildActive =
          node.tree.props.selection && node.data.type === "tree"
            ? hasActiveChild(node.data, node.tree.props.selection)
            : false;

        const firstChildSlug = getFirstRenderableChild(node, {
          isStorybook: true,
        });

        return (
          <SidebarSectionTitle
            as={Link}
            to={firstChildSlug}
            style={finalStyle}
            data-active={isChildActive}
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
      }}
    </SidebarTree>
  );
};

import React from "react";
import { Outlet, Link } from "react-router-dom";
import { StoryTree, useStoryTree } from "../hooks/useStoryTree";

interface TreeItemProps {
  tree: StoryTree;
  path?: string[];
}

const TreeItem = ({ tree, path = [] }: TreeItemProps) => {
  return (
    <>
      {Object.entries(tree).map(([title, items]) => {
        const currentPath = [...path, title];
        const pathString = currentPath.join("-");

        return (
          <React.Fragment key={`group-${pathString}`}>
            {Array.isArray(items) ? (
              <Link key={pathString} to={pathString}>
                {title}
              </Link>
            ) : (
              <>
                <span style={{ color: "grey" }}>{title}</span>
                <TreeItem tree={items} path={currentPath} />
              </>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

export const Docs = () => {
  const tree = useStoryTree();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr" }}>
      <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <TreeItem tree={tree} />
      </ul>
      <Outlet />
    </div>
  );
};

import React from "react";
import { styled } from "@fwoosh/components";
import { panels } from "@fwoosh/app/ui";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { Story } from "./Story";
import { ToolPanels } from "./ToolPanels";

const PanelContainer = styled("div", {
  height: "100%",
  borderTop: "1px solid $gray4",
  backgroundColor: "$gray0",
});

const PanelResizer = styled("div", {
  width: "100%",
  borderTop: "1px solid transparent",
  zIndex: 100,
  position: "relative",

  "&:after": {
    height: 12,
    position: "absolute",
    transform: "translateY(-50%)",
    left: 0,
    right: 0,
    top: "50%",
    content: "''",
  },

  "&:hover": {
    borderColor: "$gray10",
  },
});

export const StoryWithTools = () => {
  const storyPaneSize = React.useMemo(() => {
    if (localStorage.getItem("fwoosh:storyPaneSize")) {
      return Number(localStorage.getItem("fwoosh:storyPaneSize"));
    }

    return 75;
  }, []);
  const storyPaneSizeSet = React.useCallback((size: number) => {
    localStorage.setItem("fwoosh:storyPaneSize", String(size));
  }, []);

  if (panels.length > 0) {
    return (
      <PanelGroup direction="vertical">
        <Panel
          maxSize={75}
          defaultSize={storyPaneSize}
          onResize={storyPaneSizeSet}
        >
          <Story />
        </Panel>
        <PanelResizeHandle>
          <PanelResizer />
        </PanelResizeHandle>
        <Panel maxSize={75}>
          <PanelContainer>
            <ToolPanels />
          </PanelContainer>
        </Panel>
      </PanelGroup>
    );
  }

  return <Story />;
};

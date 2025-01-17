import React from "react";
import {
  Content,
  SidebarItems,
  SidebarLayout,
  Sidebar,
  Spinner,
  HeaderBar,
  HeaderTitle,
} from "@fwoosh/components";
import { styled } from "@fwoosh/styling";
import { Outlet } from "react-router-dom";
import { useId } from "@radix-ui/react-id";
import { ParameterContext } from "@fwoosh/hooks";
import { config } from "@fwoosh/app/config";
import { CONTENT_ID } from "@fwoosh/utils";

import { StoryIdContext } from "./Story";
import { WorkbenchSidebarTree } from "./sidebar/WorkbenchSidebarTree";
import { useParameters } from "../hooks/useParameters";
import { WorkbenchToolbar } from "./WorkbenchToolbar";

const StoryWrapper = styled("div", {
  position: "relative",
  height: "100%",
  display: "flex",
  flexDirection: "column",
});

const StoryWrapperWithParams = () => {
  const parameters = useParameters();

  return (
    <ParameterContext.Provider value={parameters}>
      <Content id={CONTENT_ID}>
        <StoryWrapper>
          <Outlet />
        </StoryWrapper>
      </Content>
    </ParameterContext.Provider>
  );
};

export const Workbench = () => {
  const id = useId();

  return (
    <StoryIdContext.Provider value={id}>
      <HeaderBar>
        <HeaderTitle>{config.title}</HeaderTitle>
        <React.Suspense fallback={<Spinner delay={2000} size={5} />}>
          <WorkbenchToolbar />
        </React.Suspense>
      </HeaderBar>

      <SidebarLayout>
        <Sidebar>
          <SidebarItems>
            <React.Suspense fallback={<Spinner delay={2000} size={8} />}>
              <WorkbenchSidebarTree />
            </React.Suspense>
          </SidebarItems>
        </Sidebar>
        <React.Suspense fallback={<Spinner delay={2000} size={8} />}>
          <StoryWrapperWithParams />
        </React.Suspense>
      </SidebarLayout>
    </StoryIdContext.Provider>
  );
};

import { Toolbar } from "@fwoosh/components";
import { styled } from "@fwoosh/styling";

export const StoryToolbar = styled(Toolbar.Root, {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "$1",
  height: "$12",
  flexShrink: 0,
});

export const GlobalToolbar = styled(Toolbar.Root, {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "$1",
  height: "$12",
  flexShrink: 0,
});

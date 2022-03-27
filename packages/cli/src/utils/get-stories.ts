import swc from "@swc/core";
import { promises as fs } from "fs";
import { paramCase, capitalCase } from "change-case";
import glob from "fast-glob";
import path from "path";

import { FwooshOptions, Story, StoryMeta } from "../types";

export async function getStories({
  stories,
  outDir,
}: FwooshOptions): Promise<{ stories: Story[]; meta: StoryMeta }[]> {
  const files = await glob(stories, {
    ignore: [`${outDir}/**`],
  });

  return Promise.all(
    files.map(async (file) => {
      const contents = await fs.readFile(file, "utf8");

      const ast = await swc.parse(contents, {
        syntax: "typescript",
        tsx: true,
        comments: false,
        script: true,
      });

      const exports = ast.body.filter(
        (node) => node.type === "ExportDeclaration"
      );

      const metaDeclaration = exports.find(
        (e) =>
          "declaration" in e &&
          e.declaration.type === "VariableDeclaration" &&
          "value" in e.declaration.declarations[0].id &&
          e.declaration.declarations[0].id.value === "meta"
      );
      const meta = (metaDeclaration as any).declaration.declarations[0].init.properties.reduce(
        (acc: Record<string, unknown>, property: Record<string, any>) => ({
          ...acc,
          [property.key.value]: property.value.value,
        }),
        {}
      );
      const storiesDeclarations = exports.filter((e) => e !== metaDeclaration);
      const fullPath = path.resolve(file);
      const stories = (storiesDeclarations as any)
        .map((d: any) => d.declaration.declarations[0].id.value)
        .map((exportName: string) => ({
          exportName,
          title: capitalCase(exportName),
          slug: `${paramCase(meta.title)}--${paramCase(exportName)}`,
          file: fullPath,
        }));

      return { stories, meta };
    })
  );
}
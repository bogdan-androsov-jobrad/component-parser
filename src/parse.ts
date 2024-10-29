import docgen from "react-docgen-typescript";
import * as prettier from "prettier";
// @ts-ignore
import commandLineArgs from "command-line-args";
import * as fs from "node:fs";
import { ArgTypes } from "@storybook/react";
import { Project, ts } from "ts-morph";
import {getControl, getDefaultValue, getOptions, getTableCategory, getType} from "./utils";

function main() {
  const project = new Project({});

  const optionDefinitions = [{ name: "path", type: String }];

  const cliOptions = commandLineArgs(optionDefinitions) as {
    path: string;
  };

  if (!cliOptions.path) {
    console.error("--path is empty");
    return;
  }

  const options = {
    savePropValueAsString: true,
    shouldExtractLiteralValuesFromEnum: true,
    shouldExtractValuesFromUnion: true,
    shouldRemoveUndefinedFromOptional: true,
    propFilter: {
      skipPropsWithName: ["ref", "id", "key"],
    },
  };

  // Parse a file for docgen info
  const info = docgen.parse(cliOptions.path, options);

  const parsedComponents = info.map((component) => {
    return {
      componentName: component.displayName,
      props: Object.values(component.props).map((prop) => {
        const { name, required, defaultValue, type, description } = prop;

        return {
          name,
          required,
          defaultValue,
          type,
          description,
        };
      }),
    };
  });

  const storyBookConfigs = parsedComponents.map((component) => {
    return {
      componentName: component.componentName,
      argTypes: component.props.reduce((acc, item) => {

        const type = getType(project, item);

        acc[item.name] = {
          type: type.name === 'function' ? 'function' : undefined,
          options: getOptions(type),
          control: getControl(type),
          description: item.description,
          table: {
            category: getTableCategory(item.name),
            defaultValue: getDefaultValue(item),
            type: {
              summary: type.raw ?? type.name,
            },
          },
        };
        return acc;
      }, {} as ArgTypes),
    };
  });

  fs.mkdirSync("dist", {
    recursive: true,
  });

  storyBookConfigs.forEach(async (config) => {
    const content = await prettier.format(
      JSON.stringify(config.argTypes, null, 4),
      { semi: false, parser: "json5" },
    );
    const filePath = `dist/${config.componentName}.txt`;
    fs.writeFileSync(filePath, content);
    console.log(`Created argTypes at ${filePath}`);
  });
}

main();

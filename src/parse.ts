import docgen, { PropItemType } from "react-docgen-typescript";
import * as prettier from "prettier";
// @ts-ignore
import commandLineArgs from "command-line-args";
import * as fs from "node:fs";
import { ArgTypes } from "@storybook/react";
import { Project, ts } from "ts-morph";
import SyntaxKind = ts.SyntaxKind;

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
        const getType = ({ type }: typeof item) => {
          const { name, raw, value: typeValues } = type;

          if (name === "enum") {
            if (raw?.includes("ReactNode")) {
              return {
                name: "function",
                raw,
              };
            }

            if (item.type.raw === "boolean" || item.type.raw === "string") {
              return item.type.raw;
            }

            const sanitizedRaw = raw
              .replace("(string & {})", "")
              .trim()
              .replace(/\|$|^\|/g, "")
              .trim();

            return {
              name: "enum",
              raw: sanitizedRaw,
              value: typeValues.map(({ value }: any) => {
                return value.replace(/"/g, "");
              }),
            };
          }

          const functionLikeList = ["=>", "EventHandler"];

          const isFunction = functionLikeList.some((attribute) => {
            return name.includes(attribute);
          });

          if (isFunction) {
            return {
              name: "function",
              raw: name,
            };
          }

          const isObjectLike = name[0] === "{" || name[name.length - 1] === "}";

          if (isObjectLike) {
            const sourceFile = project.createSourceFile(
              "__tempfile__.ts",
              name,
            );

            try {
              const objectType = sourceFile
                .getFirstDescendantByKind(SyntaxKind.Block)
                .getChildrenOfKind(SyntaxKind.LabeledStatement)
                .reduce((acc, item) => {
                  const key = item
                    .getFirstChildByKind(SyntaxKind.Identifier)
                    .getText();
                  const value = item
                    .getFirstChildByKind(SyntaxKind.ExpressionStatement)
                    .getFirstChildByKind(SyntaxKind.Identifier)
                    .getText();

                  acc[key] = {
                    name: value,
                  };
                  return acc;
                }, {} as any);

              return {
                name: "object",
                value: objectType,
              };
            } finally {
              sourceFile.delete();
            }
          }

          return item.type;
        };

        const getControl = (type: PropItemType | string | boolean) => {
          if (typeof type !== "object") {
            return undefined;
          }

          const controlType = {
            string: "text" as const,
            boolean: "boolean" as const,
            enum: "select" as const,
          }[type.name];

          return controlType
            ? {
                type: controlType,
              }
            : undefined;
        };

        const getOptions = (type: PropItemType | string | boolean) => {
          if (typeof type !== "object") {
            return undefined;
          }
          if (type?.name !== "enum") {
            return undefined;
          }
          return type.value;
        };

        const type = getType(item);
        const defaultValue = item.defaultValue?.value;

        const hasDefaultValue =
          defaultValue !== undefined && defaultValue !== null;

        acc[item.name] = {
          options: getOptions(type),
          control: getControl(type),
          description: item.description,
          type: type as any,
          table: {
            defaultValue: hasDefaultValue
              ? { summary: defaultValue }
              : undefined,
            type: {
              summary:
                typeof type !== "object" ? type : (type.raw ?? type.name),
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

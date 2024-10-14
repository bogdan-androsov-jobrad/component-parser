# Parse component utility

Small utility that can transform typescript type definition into `argTypes` structure for storybook.

## How to use

```shell
pnpm parse --path=/Users/bogdan.androsov/Projects/breakaway-ui/apps/storybook/node_modules/@jobrad-gmbh/breakaway-ui/src/RadioGroup/RadioGroup.tsx
```
### Note:

--path should be absolute path


## Example


The following typescript type
```typescript
type RadioButtonProps = AriaRadioProps
```

Will be transformed into:

```js
{
    value: {
        control: {
            type: "text",
        },
        description: "The value of the radio button, used when submitting an HTML form.\nSee [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio#Value).",
            type: {
            name: "string",
        },
        table: {
            type: {
                summary: "string",
            },
        },
    },
    children: {
        description: "The label for the Radio. Accepts any renderable node.",
            type: {
            name: "function",
                raw: "ReactNode",
        },
        table: {
            type: {
                summary: "ReactNode",
            },
        },
    },
    isDisabled: {
        description: "Whether the radio button is disabled or not.\nShows that a selection exists, but is not available in that circumstance.",
            type: "boolean",
            table: {
            type: {
                summary: "boolean",
            },
        },
    },
    autoFocus: {
        description: "Whether the element should receive focus on render.",
            type: "boolean",
            table: {
            type: {
                summary: "boolean",
            },
        },
    },
    onFocus: {
        description: "Handler that is called when the element receives focus.",
            type: {
            name: "function",
                raw: "(e: FocusEvent<Element, Element>) => void",
        },
        table: {
            type: {
                summary: "(e: FocusEvent<Element, Element>) => void",
            },
        },
    },
    onBlur: {
        description: "Handler that is called when the element loses focus.",
            type: {
            name: "function",
                raw: "(e: FocusEvent<Element, Element>) => void",
        },
        table: {
            type: {
                summary: "(e: FocusEvent<Element, Element>) => void",
            },
        },
    },
    onFocusChange: {
        description: "Handler that is called when the element's focus status changes.",
            type: {
            name: "function",
                raw: "(isFocused: boolean) => void",
        },
        table: {
            type: {
                summary: "(isFocused: boolean) => void",
            },
        },
    },
    onKeyDown: {
        description: "Handler that is called when a key is pressed.",
            type: {
            name: "function",
                raw: "(e: KeyboardEvent) => void",
        },
        table: {
            type: {
                summary: "(e: KeyboardEvent) => void",
            },
        },
    },
    onKeyUp: {
        description: "Handler that is called when a key is released.",
            type: {
            name: "function",
                raw: "(e: KeyboardEvent) => void",
        },
        table: {
            type: {
                summary: "(e: KeyboardEvent) => void",
            },
        },
    },
    id: {
        control: {
            type: "text",
        },
        description: "The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id).",
            type: {
            name: "string",
        },
        table: {
            type: {
                summary: "string",
            },
        },
    },
    "aria-label": {
        control: {
            type: "text",
        },
        description: "Defines a string value that labels the current element.",
            type: {
            name: "string",
        },
        table: {
            type: {
                summary: "string",
            },
        },
    },
    "aria-labelledby": {
        control: {
            type: "text",
        },
        description: "Identifies the element (or elements) that labels the current element.",
            type: {
            name: "string",
        },
        table: {
            type: {
                summary: "string",
            },
        },
    },
    "aria-describedby": {
        control: {
            type: "text",
        },
        description: "Identifies the element (or elements) that describes the object.",
            type: {
            name: "string",
        },
        table: {
            type: {
                summary: "string",
            },
        },
    },
    "aria-details": {
        control: {
            type: "text",
        },
        description: "Identifies the element (or elements) that provide a detailed, extended description for the object.",
            type: {
            name: "string",
        },
        table: {
            type: {
                summary: "string",
            },
        },
    },
}
```
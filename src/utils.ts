import {PropItemType} from "react-docgen-typescript";
import {Project, SyntaxKind} from "ts-morph";

export const getTableCategory = (name: string) => {
	if (isEventHandler(name)) {
		return 'event handler';
	}

	if (isAriaProps(name)){
		return 'aria';
	}

	return 'core';
}

const isEventHandler = (name: string) => {
	return /^on[A-Z][a-zA-Z]*$/.test(name);
}

const isAriaProps = (name: string) => {
	return /^aria(-[a-z]+|[A-Z][a-zA-Z]*)$/.test(name);
}

export const getType = (project: Project, { type }: {
	type: PropItemType
}) => {

	const { name, raw, value: typeValues } = type;


	if (name === "enum") {


		const functionLikeEnums = ['ReactNode', 'ReactElement'];

		const isFunction = functionLikeEnums.some((value) => {
			return raw?.includes(value);
		})

		if (isFunction) {
			return {
				name: "function",
				raw,
			};
		}

		if (raw === "boolean" || raw === "string") {
			return {
				name: raw
			}
		}

		/*
			Remove weird typings
		 */
		const sanitizedRaw = raw
			.replace("(string & {})", "")
			.trim()
			.replace(/\|$|^\|/g, "")
			.trim();

		return {
			name: "enum",
			raw: sanitizedRaw,
			value: typeValues
				.filter(({value}: any) => {
					return value !== 'string & {}'
				})
				.map(({ value }: any) => {
					return value.replace(/"/g, "");
				}),
		};
	}

	const functionLikeList = ["=>", "EventHandler", "ReactElement"];

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
				raw: name
			};
		} finally {
			sourceFile.delete();
		}
	}

	return type;
};

export const getDefaultValue = (item: {
	defaultValue: any;
}) => {
	const defaultValue = item.defaultValue?.value;

	const hasDefaultValue =
		defaultValue !== undefined && defaultValue !== null;

	return hasDefaultValue
		? { summary: defaultValue }
		: undefined;
}

export const getControl = (type: PropItemType) => {

	const getControlType = (name: string) => {
		switch (name){
			case "boolean":
				return 'boolean' as const
			case "enum":
				return 'select' as const
			case "string":
				return 'text' as const
			case "object":
				return 'object' as const
			case "number":
				return 'number' as const
			default:
				return undefined;
		}
	}

	const controlType = getControlType(type.name);

	if (!controlType) {
		return undefined;
	}

	if (controlType === 'object'){
		return controlType;
	}

	return {
		type: controlType,
	}
};

export const getOptions = (type: PropItemType) => {
	if (type.name !== "enum") {
		return undefined;
	}
	return type.value;
};
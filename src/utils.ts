export const getTableCategory = (name: string) => {
	if (isEventHandler(name)) {
		return 'event handler';
	}

	if (isAriaProps(name)){
		return 'aria';
	}

	return undefined;
}

const isEventHandler = (name: string) => {
	return /^on[A-Z][a-zA-Z]*$/.test(name);
}

const isAriaProps = (name: string) => {
	return /^aria(-[a-z]+|[A-Z][a-zA-Z]*)$/.test(name);
}
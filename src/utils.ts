export function getValueByPath(obj: any, path: string) {
	return path.split(".").reduce((acc, part) => acc && acc[part], obj);
}

export function processTopicInput(topicInput: string) {
	const trimmedInput = topicInput.replace(/\s+/g, "");

	if (trimmedInput.includes(",")) {
		return trimmedInput.split(",");
	} else {
		return [trimmedInput];
	}
}

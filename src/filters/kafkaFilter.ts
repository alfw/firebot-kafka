import { EventFilter } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-filter-manager";
import { KAFKA_EVENT, KAFKA_SOURCE } from "../constants";

type EventFilterExtended = EventFilter & {
	getSelectedValueDisplay(filterSettings: any): string;
};

export const KafkaFilter: EventFilterExtended = {
	id: `${KAFKA_SOURCE}:filter`,
	name: "Topic",
	description: "Filter based on topic",
	events: [
		{
			eventSourceId: KAFKA_SOURCE,
			eventId: KAFKA_EVENT
		}
	],
	comparisonTypes: ["is", "is not"],
	valueType: "preset",
	presetValues: (backendCommunicator, $q) => {
		return $q.when(
			backendCommunicator.fireEventAsync("get-kafka-topics").then((data: string[]) => {
				return data.map((s) => {
					return {
						value: s,
						display: s
					};
				});
			})
		);
	},
	getSelectedValueDisplay: (filterSettings) => {
		const capitalize = ([first, ...rest]: string[]) => first.toUpperCase() + rest.join("").toLowerCase();

		if (filterSettings.value == null) {
			return "[Not set]";
		}

		return capitalize(filterSettings.value);
	},
	predicate: async (filterSettings, eventData) => {
		const { comparisonType, value } = filterSettings;
		const { eventMeta } = eventData;

		switch (comparisonType) {
			case "is":
				return eventMeta.topic === value;
			case "is not":
				return eventMeta.topic !== value;
			default:
				return false;
		}
	}
};

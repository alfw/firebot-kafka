import { EventFilter } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-filter-manager";

export const KafkaFilter: EventFilter = {
	id: "KAFKA_ID:filter",
	name: "Id filter",
	description: "Filter based on id",
	events: [
		{
			eventSourceId: "KAFKA_ID",
			eventId: "KAFKA_ID_TEST"
		}
	],
	comparisonTypes: ["is", "is not"],
	valueType: "preset",
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
	},
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
	}
};

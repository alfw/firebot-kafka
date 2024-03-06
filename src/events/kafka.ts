import { EventSource } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-manager";

export const KafkaEvent: EventSource = {
	id: "KAFKA_ID",
	name: "Kafka",
	events: [
		{
			id: "KAFKA_ID_TEST",
			name: "Kafka Event",
			description: "Kafka topic event",
			manualMetadata: {}
		}
	]
};

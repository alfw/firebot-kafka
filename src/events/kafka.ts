import { EventSource } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-manager";
import { KAFKA_EVENT, KAFKA_SOURCE } from "../constants";

export const KafkaEvent: EventSource = {
	id: KAFKA_SOURCE,
	name: "Kafka",
	events: [
		{
			id: KAFKA_EVENT,
			name: "Kafka Event",
			description: "Kafka topic event",
			manualMetadata: {}
		}
	]
};

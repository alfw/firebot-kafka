import { Kafka, logLevel } from "kafkajs";
import { logger } from "./logger";
import { EventManager } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-manager";
import { KAFKA_EVENT, KAFKA_SOURCE } from "./constants";

type InitKafka = {
	broker: string;
	username: string;
	password: string;
	topics: string[];
	eventManager: EventManager;
};

let kafka: Kafka;

export async function initKafka(config: InitKafka) {
	logger.info("initKafka", config);
	kafka = new Kafka({
		brokers: [config.broker],
		ssl: true,
		sasl: {
			mechanism: "scram-sha-256",
			username: config.username,
			password: config.password
		},
		logLevel: logLevel.ERROR
	});

	const consumer = kafka.consumer({ groupId: "YOUR_CONSUMER_GROUP" });
	await consumer.connect();

	config.topics.forEach(async (v) => {
		await consumer.subscribe({ topic: v, fromBeginning: true });
	});

	await consumer.run({
		eachMessage: async ({ topic, partition, message }) => {
			logger.info("Each", {
				value: JSON.parse(message.value.toString())
			});
			config.eventManager.triggerEvent(KAFKA_SOURCE, KAFKA_EVENT, {
				topic,
				...JSON.parse(message.value.toString())
			});
		}
	});
}

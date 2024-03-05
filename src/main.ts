import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import { Kafka, logLevel } from "kafkajs";

interface Params {
	topic: string;
	username: string;
	password: string;
	broker: string;
}

const script: Firebot.CustomScript<Params> = {
	getScriptManifest: () => {
		return {
			name: "Kafka Consumer",
			description: "A Kafka consumer script",
			author: "Alfw",
			version: "1.0",
			firebotVersion: "5"
		};
	},
	getDefaultParameters: () => {
		return {
			topic: {
				type: "string",
				default: "firebot",
				description: "Kafka Topic",
				secondaryDescription: "Enter topic name"
			},
			username: {
				type: "string",
				default: "root",
				description: "Username",
				secondaryDescription: "Enter your username here"
			},
			password: {
				type: "password",
				default: "",
				description: "Password",
				secondaryDescription: "Enter a message here"
			},
			broker: {
				type: "string",
				default: "Hello World!",
				description: "Broker",
				secondaryDescription: "Enter broker URL + port ( url.com:9092)"
			}
		};
	},
	run: async (runRequest) => {
		const { logger, eventManager, replaceVariableManager, eventFilterManager } = runRequest.modules;

		const kafka = new Kafka({
			brokers: [runRequest.parameters.broker],
			ssl: true,
			sasl: {
				mechanism: "scram-sha-256",
				username: runRequest.parameters.username,
				password: runRequest.parameters.password
			},
			logLevel: logLevel.ERROR
		});

		const consumer = kafka.consumer({ groupId: "YOUR_CONSUMER_GROUP" });
		await consumer.connect();
		await consumer.subscribe({ topic: runRequest.parameters.topic, fromBeginning: true });

		await consumer.run({
			eachMessage: async ({ topic, partition, message }) => {
				logger.info("Each", {
					value: JSON.parse(message.value.toString())
				});
				eventManager.triggerEvent("KAFKA_ID", "KAFKA_ID_TEST", {
					...JSON.parse(message.value.toString())
				});
			}
		});

		eventManager.registerEventSource({
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
		});

		replaceVariableManager.registerReplaceVariable({
			definition: {
				handle: "kafkadata",
				description: "Object of kafka",
				triggers: {
					event: ["KAFKA_ID:KAFKA_ID_TEST"]
				},
				possibleDataOutput: ["text"]
			},
			evaluator: function (trigger: Effects.Trigger, ...args: string[]) {
				return getValueByPath(trigger.metadata.eventData, args[0]);
			}
		});
	}
};

function getValueByPath(obj: any, path: string) {
	return path.split(".").reduce((acc, part) => acc && acc[part], obj);
}

export default script;

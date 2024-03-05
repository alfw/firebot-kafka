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
				secondaryDescription: "Enter topic name (can be comma separated list)"
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
		const { logger, eventManager, replaceVariableManager, eventFilterManager, frontendCommunicator } =
			runRequest.modules;

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

		let topics = processTopicInput(runRequest.parameters.topic);

		topics.forEach(async (v) => {
			await consumer.subscribe({ topic: v, fromBeginning: true });
		});

		await consumer.run({
			eachMessage: async ({ topic, partition, message }) => {
				logger.info("Each", {
					value: JSON.parse(message.value.toString())
				});
				eventManager.triggerEvent("KAFKA_ID", "KAFKA_ID_TEST", {
					topic,
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
				examples: [
					{
						description: "Get the topic",
						usage: "topic"
					}
				],
				possibleDataOutput: ["text"]
			},
			evaluator: function (trigger: Effects.Trigger, ...args: string[]) {
				return getValueByPath(trigger.metadata.eventData, args[0]);
			}
		});

		eventFilterManager.registerFilter({
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
		});

		frontendCommunicator.onAsync<never, string[]>("get-kafka-topics", async () => {
			return topics;
		});
	}
};

function getValueByPath(obj: any, path: string) {
	return path.split(".").reduce((acc, part) => acc && acc[part], obj);
}

function processTopicInput(topicInput: string) {
	const trimmedInput = topicInput.replace(/\s+/g, "");

	if (trimmedInput.includes(",")) {
		return trimmedInput.split(",");
	} else {
		return [trimmedInput];
	}
}

export default script;

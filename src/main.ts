import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import { initLogger } from "./logger";
import { initKafka } from "./kafka";
import { KafkaEvent } from "./events/kafka";
import { KafkaFilter } from "./filters/kafkaFilter";
import { KafkaDataReplace } from "./replaceVariables/kafkaData";
import { processTopicInput } from "./utils";

declare const VERSION: string;

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
			version: `${VERSION}`,
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

		initLogger(logger);
		let topics = processTopicInput(runRequest.parameters.topic);

		initKafka({
			broker: runRequest.parameters.broker,
			password: runRequest.parameters.password,
			topics,
			username: runRequest.parameters.username,
			eventManager
		});

		eventManager.registerEventSource(KafkaEvent);

		replaceVariableManager.registerReplaceVariable(KafkaDataReplace);

		eventFilterManager.registerFilter(KafkaFilter);

		frontendCommunicator.onAsync<never, string[]>("get-kafka-topics", async () => {
			return topics;
		});
	}
};

export default script;

import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import { getValueByPath } from "../utils";
import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import { KAFKA_SOURCE } from "../constants";

export const KafkaDataReplace: ReplaceVariable = {
	definition: {
		handle: "kafkadata",
		description: "Get data from the kafka event.",
		triggers: {
			event: [`${KAFKA_SOURCE}:${KAFKA_EVENT}`]
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
};

import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import { getValueByPath } from "../utils";
import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";

export const KafkaDataReplace: ReplaceVariable = {
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
};

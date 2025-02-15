import UniversalFunctions from "../../utils/universalFunctions.js";
import Joi from "joi";
import Controller from "../../controllers/index.js";
const Config = UniversalFunctions.CONFIG;

const createGovernorRoute = {
	method: "POST",
	path: "/api/demo/createGovernorRoute",
	options: {
		description: "demo api",
		tags: ["api"],
		handler: function (request, h) {
			var payloadData = request.payload;
			Controller.SetCreateGovernor(payloadData);
			return UniversalFunctions.sendSuccess(Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, {});
		},
		validate: {
			payload: Joi.object({
				jobID: Joi.string(),
				datashopServerAddress: Joi.string(),
				dataFileURL: Joi.object({
					url: Joi.string().min(0),
					json: Joi.object({
						name: Joi.string().required(),
						governanceToken: Joi.number().required(),
						tokenAmount: Joi.number().required(),
						choiceNumber: Joi.number().required(),
						votingCloseTime: Joi.number().required(),
						ideas: Joi.array().items(Joi.number()).required(),
					}),
				}),
			}).label("Demo Model"),
			failAction: UniversalFunctions.failActionFunction,
		},
		plugins: {
			"hapi-swagger": {
				responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages,
			},
		},
	},
};

export default createGovernorRoute;

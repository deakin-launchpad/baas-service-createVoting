import UniversalFunctions from "../../utils/universalFunctions.js";
import Joi from "joi";
import Controller from "../../controllers/index.js";
const Config = UniversalFunctions.CONFIG;

const createIdeaRoute = {
	method: "POST",
	path: "/api/demo/createIdeaRoute",
	options: {
		description: "demo api",
		tags: ["api"],
		handler: function (request, h) {
			var payloadData = request.payload;
			Controller.SetCreateIdea(payloadData);
			return UniversalFunctions.sendSuccess(Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, {});
		},
		validate: {
			payload: Joi.object({
				jobID: Joi.string(),
				datashopServerAddress: Joi.string(),
				dataFileURL: Joi.object({
					url: Joi.string().min(0),
					json: Joi.object({
						creator: Joi.string().required(),
						name: Joi.string().required(),
						description: Joi.string().required(),
						video_url: Joi.string(),
						slide_url: Joi.string(),
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

export default createIdeaRoute;
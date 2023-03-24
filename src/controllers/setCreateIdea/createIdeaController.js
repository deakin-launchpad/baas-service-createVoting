import async from "async";
import UniversalFunctions from "../../utils/universalFunctions.js";
const ERROR = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;
import { connectToAlgorand, getBlockchainAccount, deployIdea, respondToServer } from "../../helpers/helperFunctions.js";

/**
 * 
 * @param {Object} payloadData
 * @param {String} payloadData.jobID
 * @param {String} payloadData.datashopServerAddress
 * @param {Object} payloadData.dataFileURL
 * @param {string} payloadData.dataFileURL.url
 * @param {Object} payloadData.dataFileURL.json
 * @param {String} payloadData.dataFileURL.json.creator
 * @param {String} payloadData.dataFileURL.json.name
 * @param {String} payloadData.dataFileURL.json.description
 * @param {String} payloadData.dataFileURL.json.video_url
 * @param {String} payloadData.dataFileURL.json.slide_url
 * @param {Function} callback 
 */
const createIdea = (payloadData, callback) => {
	const data = payloadData.dataFileURL.json;
	// const data = payloadData.dataObject.json;
	console.log(data);
	let algoClient;
	let account;
	let appId;

	const tasks = {
		connectToBlockchain: (cb) => {
			algoClient = connectToAlgorand("", "https://testnet-api.algonode.cloud", 443);
			if (!algoClient) return cb(ERROR.APP_ERROR);
			cb();
		},
		getBlockchainAccount: (cb) => {
			account = getBlockchainAccount();
			if (!account) return cb(ERROR.APP_ERROR);
			cb();
		},
		createIdea: (cb) => {
			const ideaData = {
				creator: data.creator,
				name: data.name,
				description: data.description,
				video_url: data.video_url,
				slide_url: data.slide_url,
			}
			deployIdea(algoClient, account, ideaData, (err, result) => {
				if (err) return cb(err);
				if (!result) return cb(ERROR.APP_ERROR);
				appId = result;
				cb();
			});
		},
	};
	async.series(tasks, (err, result) => {
		let returnData;
		if (err || !appId) {
			// respond to server with error
			returnData = null;
		} else {
			// respond to server with success
			returnData = { appId };
		}
		respondToServer(payloadData, returnData, (err, result) => {
			if (err) {
				console.log(err);
			} else {
				console.log(result);
			}
		});
	});
};

export default createIdea;
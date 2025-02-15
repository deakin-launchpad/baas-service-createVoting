import async from "async";
import UniversalFunctions from "../../utils/universalFunctions.js";
const ERROR = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;
import { connectToAlgorand, getBlockchainAccount, finalizeVoting, respondToServer} from "../../helpers/helperFunctions.js";

/**
 * 
 * @param {Object} payloadData
 * @param {String} payloadData.jobID
 * @param {String} payloadData.datashopServerAddress
 * @param {Object} payloadData.dataFileURL
 * @param {string} payloadData.dataFileURL.url
 * @param {Object} payloadData.dataFileURL.json
 * @param {Number} payloadData.dataFileURL.json.governorId
 * @param {Number} payloadData.dataFileURL.json.boxId
 * @param {Object[]} payloadData.dataFileURL.json.options
 * @param {Function} callback 
 */
const operateFinaliVoting = (payloadData, callback) => {
	const data = payloadData.dataFileURL.json;
	// const data = payloadData.dataObject.json;
	console.log(data);
	let algoClient;
	let account;
	let votingResult;

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
		finalizeVoting: (cb) => {
			const requiredData = {
				governorId: data.governorId,
				boxId: data.boxId,
				options: data.options,
			}
			finalizeVoting(algoClient, account, requiredData, (err, result) => {
				if (err) return cb(err);
				if (!result) return cb(ERROR.APP_ERROR);
				votingResult = result;
				cb();
			});
		}
	};
	async.series(tasks, (err, result) => {
		let returnData;
		if (err || !votingResult) {
			// respond to server with error
			returnData = null;
		} else {
			// respond to server with success
			returnData = { votingResult };
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

export default operateFinaliVoting;
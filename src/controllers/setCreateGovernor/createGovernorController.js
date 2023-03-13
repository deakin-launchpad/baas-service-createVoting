import async from "async";
import UniversalFunctions from "../../utils/universalFunctions.js";
const ERROR = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;
import { connectToAlgorand, getBlockchainAccount, deployBox, respondToServer, deployGovernor } from "../../helpers/helperFunctions.js";

/**
 *
 * @param {Object} payloadData
 * @param {String} payloadData.jobID
 * @param {String} payloadData.datashopServerAddress
 * @param {Object} payloadData.dataFileURL
 * @param {string} payloadData.dataFileURL.url
 * @param {Object} payloadData.dataFileURL.json
 * @param {String} payloadData.dataFileURL.json.name
 * @param {Number} payloadData.dataFileURL.json.governanceToken
 * @param {Object[]} payloadData.dataFileURL.json.ideas
 * @param {Number} payloadData.dataFileURL.json.tokenAmount
 * @param {Number} payloadData.dataFileURL.json.choiceNumber
 * @param {Number} payloadData.dataFileURL.json.votingCloseTime
 * @param {Function} callback
 */
const createVoting = (payloadData, callback) => {
	const data = payloadData.dataFileURL.json;
	// const data = payloadData.dataObject.json;
	console.log(data);
	let algoClient;
	let account;
	let appId;
	let boxId;

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
		deployBox: (cb) => {
			deployBox(algoClient, account, (err, result) => {
				if (err) return cb(err);
				boxId = result;
				cb();
			});
		},
		deployGovernor: (cb) => {
			const governorData = {
				name: data.name,
				ideas: data.ideas,
				governanceToken: data.governanceToken,
				tokenAmount: data.tokenAmount,
				choiceNumber: data.choiceNumber,
				votingCloseTime: data.votingCloseTime,
			};
			deployGovernor(algoClient, account, governorData, (err, result) => {
				if (err) return cb(err);
				if (!result) return cb(ERROR.APP_ERROR);
				appId = result;
				cb();
			});
		},
	};
	async.series(tasks, (err, result) => {
		let returnData;
		if (err || !appId || !boxId) {
			// respond to server with error
			returnData = null;
		} else {
			// respond to server with success
			returnData = { appId, boxId };
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

export default createVoting;

import async from "async";
import UniversalFunctions from "../../utils/universalFunctions.js";
const ERROR = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;
import { connectToAlgorand, getBlockchainAccount, deployBox, respondToServer, deployGovernor } from "../../helpers/helperFunctions.js";

/**
 * 
 * @param {Object} payloadData
 * @param {String} payloadData.jobID
 * @param {String} payloadData.datashopServerAddress
 * @param {Object} payloadData.dataObject
 * @param {Number} payloadData.dataObject.funding
 * @param {String} payloadData.dataObject.proposal
 * @param {Number} payloadData.dataObject.governorToken
 * @param {Object[]} payloadData.dataObject.options
 * @param {Number} payloadData.dataObject.tokenAmount
 * @param {Number} payloadData.dataObject.choiceNumber
 * @param {Number} payloadData.dataObject.votingEnd
 * @param {Function} callback 
 */
const createVoting = (payloadData, callback) => {
	const data = payloadData.dataObject;
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
				proposal: data.proposal,
				funding: data.funding,
				options: data.options,
				governorToken: data.governorToken,
				tokenAmount: data.tokenAmount,
				choiceNumber: data.choiceNumber,
				votingEnd: data.votingEnd,
			}
			deployGovernor(algoClient, account, governorData, (err, result) => {
				if (err) return cb(err);
				if (!result) return cb(ERROR.APP_ERROR);
				appId = result;
				cb();
			});
		},
		response: (cb) => {
			const response = { appId, boxId };
			console.log(response);
			respondToServer(payloadData, response, (err, result) => {
				if (err) return cb(err);
				console.log(result);
				cb();
			})
		},
	};
	async.series(tasks, (err, result) => {
		if (err) return callback(err);
		return callback(null, { appId, vaultId, vaultAddress });
	});
};

export default createVoting;
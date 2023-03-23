import algosdk, { decodeAddress, encodeAddress, encodeUint64, isValidAddress, makeBasicAccountTransactionSigner } from "algosdk";
import axios from "axios";
import createBox from "../contracts/createBox.js";
import clearBox from "../contracts/clearBox.js";
import createGovernor from "../contracts/createGovernor.js";
import clearGovernor from "../contracts/clearGovernor.js";
import createIdea from "../contracts/createIdea.js";
import clearIdea from "../contracts/createIdea.js";

/**
 *
 * @param {String} token
 * @param {String} server
 * @param {Number} port
 */
export const connectToAlgorand = (token, server, port) => {
	console.log("=== CONNECT TO NETWORK ===");
	const algoClient = new algosdk.Algodv2(token, server, port);
	return algoClient;
};

export const getBlockchainAccount = () => {
	console.log("=== GET ACCOUNT ===");
	const account = algosdk.mnemonicToSecretKey(process.env.MNEMONIC);
	console.log("Account: " + account.addr);
	return account;
};

/**
 *
 * @param {String} algoClient
 * @param {Object} account
 * @param {Object} transaction
 * @param {Object} data
 * @param {any} signedTx
 * @param {Callback} callback
 */
export const createAndSignTransaction = async (algoClient, account, transaction, data, signedTx, callback) => {
	console.log("=== CREATE AND SIGN TRANSACTION ===");
	let suggestedParams, signed;
	await algoClient
		.getTransactionParams()
		.do()
		.then(async (value) => {
			suggestedParams = value;
			const appIndex = 103723509;
			const appArgs = [new Uint8Array(Buffer.from("set_number")), encodeUint64(parseInt(data.numberToSet))];
			transaction = algosdk.makeApplicationNoOpTxn(account.addr, suggestedParams, appIndex, appArgs);
			signedTx = await algosdk.signTransaction(transaction, account.sk);
			signed = signedTx;
		})
		.catch((err) => {
			return callback(err);
		});
	return signed;
};

/**
 *
 * @param {String} algoClient
 * @param {any} callback
 */
export const sendTransaction = async (algoClient, signedTx, txnId, cb) => {
	console.log("=== SEND TRANSACTION ===");
	await algoClient
		.sendRawTransaction(signedTx.blob)
		.do()
		.then((_txnId) => {
			txnId = _txnId;
			console.log(txnId);
			return;
		})
		.catch((e) => {
			return cb(e);
		});
	return cb();
};

/**
 *
 * @param {Object} payloadData
 * @param {any} cb
 */
export const respondToServer = (payloadData, data, callback) => {
	console.log("=== RESPOND TO SERVER ===");
	let service = payloadData;
	let destination = service.datashopServerAddress + "/api/job/updateJob";
	let lambdaInput;
	if (data) {
		lambdaInput = {
			insightFileURL: service.dataFileURL,
			jobid: service.jobID,
			returnData: data,
		};
	} else {
		lambdaInput = {
			insightFileURL: "N/A", // failed job status
			jobid: service.jobID,
		};
	}
	axios
		.put(destination, lambdaInput)
		.then((res) => {
			callback(null, "Job responded");
		})
		.catch((e) => {
			callback(e, null);
		});
};

const compileProgram = async (client, programSource) => {
	let encoder = new TextEncoder();
	let programBytes = encoder.encode(programSource);
	let compileResponse = await client.compile(programBytes).do();
	let compiledBytes = new Uint8Array(Buffer.from(compileResponse.result, "base64"));
	return compiledBytes;
};

const EncodeBytes = (utf8String) => {
	let enc = new TextEncoder();
	return enc.encode(utf8String);
};

const DecodeBase64 = (base64) => {
	return Buffer.from(base64, "base64").toString("utf8");
};

export const deployBox = async (algoClient, account, callback) => {
	console.log("=== DEPLOY RESULT BOX ===");
	try {
		let params = await algoClient.getTransactionParams().do();
		let senderAddr = account.addr;
		let counterProgram = await compileProgram(algoClient, createBox);
		let clearProgram = await compileProgram(algoClient, clearBox);
		let onComplete = algosdk.OnApplicationComplete.NoOpOC;

		let localInts = 0;
		let localBytes = 0;
		let globalInts = 32;
		let globalBytes = 32;

		let accounts = undefined;
		let foreignApps = undefined;
		let foreignAssets = undefined;
		let appArgs = undefined;

		let deployContract = algosdk.makeApplicationCreateTxn(
			senderAddr,
			params,
			onComplete,
			counterProgram,
			clearProgram,
			localInts,
			localBytes,
			globalInts,
			globalBytes,
			appArgs,
			accounts,
			foreignApps,
			foreignAssets,
			Uint8Array.from([Math.random()*255, Math.random()*255, Math.random()*255])
		);
		let signedTxn = deployContract.signTxn(account.sk);

		// Submit the transaction
		let tx = await algoClient.sendRawTransaction(signedTxn).do();
		let confirmedTxn = await algosdk.waitForConfirmation(algoClient, tx.txId, 4);
		let transactionResponse = await algoClient.pendingTransactionInformation(tx.txId).do();
		let appId = transactionResponse["application-index"];

		// Print the completed transaction and new ID
		console.log("Transaction " + tx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
		console.log("The application ID is: " + appId);
		callback(null, appId);
	} catch (err) {
		console.log(err);
		callback(err, null);
	}
};

export const deployGovernor = async (algoClient, account, data, callback) => {
	console.log("=== DEPLOY GOVERNOR CONTRACT ===");
	try {
		let params = await algoClient.getTransactionParams().do();
		let senderAddr = account.addr;
		let counterProgram = await compileProgram(algoClient, createGovernor);
		let clearProgram = await compileProgram(algoClient, clearGovernor);
		let onComplete = algosdk.OnApplicationComplete.NoOpOC;

		let localInts = 1;
		let localBytes = 15;
		let globalInts = 32;
		let globalBytes = 32;

		let accounts = undefined;
		let foreignApps = undefined;
		let foreignAssets = [data.governanceToken];
		let appArgs = [];
		appArgs.push(EncodeBytes(data.name), encodeUint64(data.tokenAmount), encodeUint64(data.choiceNumber), encodeUint64(data.votingCloseTime));

		let deployContract = algosdk.makeApplicationCreateTxn(
			senderAddr,
			params,
			onComplete,
			counterProgram,
			clearProgram,
			localInts,
			localBytes,
			globalInts,
			globalBytes,
			appArgs,
			accounts,
			foreignApps,
			foreignAssets
		);
		let signedTxn = deployContract.signTxn(account.sk);

		// Submit the transaction
		let tx = await algoClient.sendRawTransaction(signedTxn).do();
		let confirmedTxn = await algosdk.waitForConfirmation(algoClient, tx.txId, 4);
		let transactionResponse = await algoClient.pendingTransactionInformation(tx.txId).do();
		let appId = transactionResponse["application-index"];

		// Print the completed transaction and new ID
		console.log("Transaction " + tx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
		console.log("The application ID is: " + appId);
		let appAddr = algosdk.getApplicationAddress(appId);
		console.log("The application address is: " + appAddr);
		await payAlgod(algoClient, account, appAddr, parseInt(101000));
		await addOptions(algoClient, account, appId, data.ideas);
		callback(null, appId);
	} catch (err) {
		console.log(err);
		callback(err, null);
	}
};

const payAlgod = async (algoClient, senderAccount, receiver, amount) => {
	console.log("=== fund contract ===");
	let params = await algoClient.getTransactionParams().do();
	let senderAddr = senderAccount.addr;
	let closeReminderTo = undefined;
	let note = undefined;
	let rekeyTo = undefined;
	let payment = algosdk.makePaymentTxnWithSuggestedParams(senderAddr, receiver, amount, closeReminderTo, note, params, rekeyTo);
	let signedTxn = payment.signTxn(senderAccount.sk);

	// Submit the transaction
	let tx = await algoClient.sendRawTransaction(signedTxn).do();
	let confirmedTxn = await algosdk.waitForConfirmation(algoClient, tx.txId, 10);
	console.log(
		amount +
			" algod has been transferred from " +
			senderAddr +
			" to " +
			receiver +
			" in the transaction " +
			tx.txId +
			" confirmed in round " +
			confirmedTxn["confirmed-round"]
	);
};

const addOptions = async (algoClient, senderAccount, appId, options) => {
	console.log("=== add voting options (up to 15) ===");
	let senderAddr = senderAccount.addr;
	let params = await algoClient.getTransactionParams().do();
	let operation = "add_options";
	let appArgs = [];
	appArgs.push(EncodeBytes(operation));
	for (const property in options) {
		appArgs.push(EncodeBytes(options[property]));
	}
	let accounts = undefined;
	let foreignApps = undefined;
	let foreignAssets = undefined;
	let note = undefined;
	let lease = undefined;
	let rekeyTo = undefined;
	let boxes = undefined;
	let governorAddOptions = algosdk.makeApplicationNoOpTxn(
		senderAddr,
		params,
		appId,
		appArgs,
		accounts,
		foreignApps,
		foreignAssets,
		note,
		lease,
		rekeyTo,
		boxes
	);
	let signedTxn = governorAddOptions.signTxn(senderAccount.sk);

	// Submit the transaction
	let tx = await algoClient.sendRawTransaction(signedTxn).do();
	let confirmedTxn = await algosdk.waitForConfirmation(algoClient, tx.txId, 4);
	console.log("Voting governor has added options in the transaction " + tx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
};

export const finalizeVoting = async (algoClient, account, data, callback) => {
	console.log("=== FINALIZE VOTING ===");
	try {
		let senderAddr = account.addr;
		let params = await algoClient.getTransactionParams().do();
		let operation = "finalize";
		let appArgs = [];
		appArgs.push(EncodeBytes(operation));
		for (const property in data.options) {
			appArgs.push(EncodeBytes(data.options[property]));
		}
		let accounts = undefined;
		let foreignApps = [data.boxId];
		let foreignAssets = undefined;
		let note = undefined;
		let lease = undefined;
		let rekeyTo = undefined;
		let boxes = undefined;
		let finalizeVotingOperation = algosdk.makeApplicationNoOpTxn(
			senderAddr,
			params,
			data.governorId,
			appArgs,
			accounts,
			foreignApps,
			foreignAssets,
			note,
			lease,
			rekeyTo,
			boxes
		);
		let signedTxn = finalizeVotingOperation.signTxn(account.sk);

		// Submit the transaction
		let tx = await algoClient.sendRawTransaction(signedTxn).do();
		let confirmedTxn = await algosdk.waitForConfirmation(algoClient, tx.txId, 4);
		console.log("Voting " + data.governorId + " has been finalized at the transaction " + tx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
		let resultApp = await algoClient.getApplicationByID(data.boxId).do();
		let resultStates = resultApp.params["global-state"];
		let result;
		if (resultStates.length == 3) {
			result = ["invalid"];
			console.log("Voting " + data.governorId + " is invalid, details can be found in the states of the governor application.");
		} else if (resultStates.length == 4) {
			let constantParams = ["completed", "governor", "proposal"];
			let votedOption, numberOfVoting;
			for (const property in resultStates) {
				if (!constantParams.includes(DecodeBase64(resultStates[property].key))) {
					votedOption = DecodeBase64(resultStates[property].key);
					numberOfVoting = resultStates[property].value.uint;
					result = ["completed", votedOption, numberOfVoting];
					break;
				}
			}
			console.log("Voting " + data.governorId + " is completed -- First place: " + votedOption + ", votes: " + numberOfVoting);
		} else callback(err, null);
		callback(null, result);
	} catch (err) {
		console.log(err);
		callback(err, null);
	}
};

export const deployIdea = async (algoClient, account, data, callback) => {
	console.log("=== CREATE IDEA ===");
	try {
		let params = await algoClient.getTransactionParams().do();
		let senderAddr = account.addr;
		let counterProgram = await compileProgram(algoClient, createIdea);
		let clearProgram = await compileProgram(algoClient, clearIdea);
		let onComplete = algosdk.OnApplicationComplete.NoOpOC;

		let localInts = 10;
		let localBytes = 5;
		let globalInts = 32;
		let globalBytes = 32;

		let accounts = [data.creator];
		let foreignApps = undefined;
		let foreignAssets = undefined;
		let appArgs = [];
		appArgs.push(EncodeBytes(data.name), EncodeBytes(data.description), EncodeBytes(data.video_url), EncodeBytes(data.slide_url));

		let deployContract = algosdk.makeApplicationCreateTxn(
			senderAddr,
			params,
			onComplete,
			counterProgram,
			clearProgram,
			localInts,
			localBytes,
			globalInts,
			globalBytes,
			appArgs,
			accounts,
			foreignApps,
			foreignAssets
		);
		let signedTxn = deployContract.signTxn(account.sk);

		// Submit the transaction
		let tx = await algoClient.sendRawTransaction(signedTxn).do();
		let confirmedTxn = await algosdk.waitForConfirmation(algoClient, tx.txId, 4);
		let transactionResponse = await algoClient.pendingTransactionInformation(tx.txId).do();
		let appId = transactionResponse["application-index"];

		// Print the completed transaction and new ID
		console.log("Transaction " + tx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
		console.log("The idea application ID is: " + appId);
		callback(null, appId);
	} catch (err) {
		console.log(err);
		callback(err, null);
	}
};

/* cLists.js 511: */
var record = ["LastModified;" + 0, "Logbookname;" + '2025', "setname;" + 'efaWeb'];
var tablename = "efaWeb_boatdamages"


/* cTxQueue.js 173: */
var txID = 42
var emptyTransaction = {
		// transaction values
		ID : -1,
		type : "",
		tablename : "",
		record : [],
		// result for container
		cresultCode : -1,
		cresultMessage : "",
		// result for transaction
		resultCode : -1,
		resultMessage : "",
		// workflow
		lock : false,
		callback : null,
		// status control
		sentAt : 0,
		retries : 0,
		resultAt : 0,
		closedAt : 0,
		// cache to know where to put changed Ids to
		listRowPos : 0
	}
var tx = Object.assign({}, emptyTransaction);
txID++
tx.ID = txID;
tx.type = "list";
tx.tablename = tablename;
tx.record = record;
tx.retries = 0;
tx.callback = null;
tx.onError = null;
console.log('tx: ')
console.log(tx)


//cTxQueue.addNewTxToPending("list", "efaWeb_boatdamages", record, 0, null, null);
cTxQueue.sendTxs([tx])


// /* cTxQueue.js 111: */
// txcID++
// var plain = apiVersion + ";" + txcID + ";@" + $_apiUserID + ";" + $_apiSessionID + ";";
// console.log('plain: '+plain)
// plain = plain.substring(0, plain.length - MESSAGE_SEPARATOR_STRING.length)
// console.log('plain: '+plain)
// var base64 = window.btoa(unescape(encodeURIComponent(plain)));
// console.log('base64: '+base64)
// var base64api = base64.replace(/\//g, '-').replace(/\+/g, '*').replace(/\=/g, '_');
// console.log('base64api: '+base64api)
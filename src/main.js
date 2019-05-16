var fileInput = document.getElementById("file-input");
var customerInput = document.getElementById("customer-input");
var invoicesProcessed;
var customersProcessed;
var customerID = [];
var customerAddressID = [];
var invoiceOutput = document.getElementById("invoice-output");
var invoiceErrors = document.getElementById("errors");

function submitCustomers(){
	// If no file is entered
	if(!customerInput.files[0]){
		alert("No File Uploaded");
		return
	}
	// Parse customer data
	Papa.parse(customerInput.files[0], {
		complete: function(results) {
			customersProcessed = results;
			allocateCustomers();
			// Create new elements in the DOM to show files
			let node = document.createElement("li");
			node.innerHTML = customerInput.files[0].name; 
			document.getElementById("customer-files").appendChild(node);
			console.log(customerID);
			console.log(customerAddressID);
		}
	});
}

function submitFile(){
	// If no file is entered
	if(!fileInput.files[0]){
		alert("No File Uploaded");
		return
	}
	// If no customer file is entered
	if(!customerInput.files[0]){
		alert("Please upload a customer file first")
		return
	}
	// Parse the data (return through a callback due to asynchronous parsing)
	Papa.parse(fileInput.files[0], {
		complete: function(results) {
			invoicesProcessed = results;
			console.log(invoicesProcessed);
			outputInvoices();
			outputErrors();			
			// Create new elements in the DOM to show files
			let node = document.createElement("li");
			node.innerHTML = fileInput.files[0].name; 
			document.getElementById("invoice-files").appendChild(node);
		}
	});	
}

function clearPage(){
	let x = document.getElementById("invoice-output");
	let y = document.getElementById("errors");
	let xChild = x.lastElementChild;
	let yChild = y.lastElementChild;
	// Loop and delete all child elements
	while(xChild){
		x.removeChild(xChild);
		xChild = x.lastElementChild;
	}
	while(yChild){
		y.removeChild(yChild);
		yChild = y.lastElementChild;
	}
}

function hideLines(){
	invoiceOutput.classList.toggle("hidden");
}

function allocateCustomers(){
	for(let i = 0; i < customersProcessed.data.length; i++){
		// Move Customer reference into array if it doesn't exist
		if(customerID.indexOf(customersProcessed.data[i][1]) < 0){
			customerID.push(customersProcessed.data[i][1]);;
		}
		// Move Office reference into array if it doesn't exist
		if(customerAddressID.indexOf(customersProcessed.data[i][4]) < 0){
			customerAddressID.push(customersProcessed.data[i][4]);
		}
	}
	console.log("Customers Entered Correctly");
}

function outputInvoices(){
	// Compile each invoice line into a variable
	let invoiceLine = "";
	for(let i = 0; i < invoicesProcessed.data.length; i++){
		invoiceLine = invoicesProcessed.data[i].join("|");
		
		// Create new elements in the DOM to output all invoice lines
		let node = document.createElement("li");
		node.innerHTML = invoiceLine;
		invoiceOutput.appendChild(node);
	}
	
}

function outputErrors(){
	hasCostCode();
	doesClientExist();
	doesOfficeExist();
	hasInvoicePrefix();
	descriptionLength();
	hasTaxCode();
	taxValue();
}

// Does Client Exist in Oracle
// Invoice Field 2 [1]
function doesClientExist(){
	for(let i = 0; i < invoicesProcessed.data.length; i++){
		if(customerID.indexOf(invoicesProcessed.data[i][1]) < 0){
			// Create new elements in the DOM to output errors
			let node = document.createElement("li");
			node.innerHTML = "Invoice " + invoicesProcessed.data[i][4] + " in file " + fileInput.files[0].name + " - No customer (" + invoicesProcessed.data[i][1] + ") in database at line " + (i + 1) + "<br><em>Invoice Line: " + invoicesProcessed.data[i].join("|") + "</em>"; 
			invoiceErrors.appendChild(node);
		}
	}
}

// Does Office Exist in Oracle
// Invoice Field 4 [3]
function doesOfficeExist(){
	for(let i = 0; i < invoicesProcessed.data.length; i++){
		if(customerAddressID.indexOf(invoicesProcessed.data[i][3]) < 0){
			// Create new elements in the DOM to output errors
			let node = document.createElement("li");
			node.innerHTML = "Invoice " + invoicesProcessed.data[i][4] + " in file " + fileInput.files[0].name + " - No office (" + invoicesProcessed.data[i][3] + ") in database at line " + (i + 1) + "<br><em>Invoice Line: " + invoicesProcessed.data[i].join("|") + "</em>"; 
			invoiceErrors.appendChild(node);
		}
	}
}

// Is Cost Code Valid
// Invoice Field 7 [6]
function hasCostCode(){	
	for(let i=0; i < invoicesProcessed.data.length; i++){
		if(invoicesProcessed.data[i].length < 16){
			// Create new elements in the DOM to output errors
			let node = document.createElement("li");
			node.innerHTML = "Invoice " + invoicesProcessed.data[i][4] + " in file " + fileInput.files[0].name + " - No Cost Code at line " + (i + 1) + "<br><em>Invoice Line: " + invoicesProcessed.data[i].join("|") + "</em>"; 
			invoiceErrors.appendChild(node);
			
			// Add temporary fields to the array to prevent further errors
			for(let y = 0; y < 3; y++){
				invoicesProcessed.data[i].splice(6, 0, "");
			}
		}
	}	
}

// Has Invoice Prefix
// Invoice Field 5 [4]
function hasInvoicePrefix(){
	for(let i = 0; i < invoicesProcessed.data.length; i++){
		// Use Regex to verify string starts with 5 characters
		var prefixRegex = /^[a-z][a-z][a-z][a-z][a-z]/i;
		if(!invoicesProcessed.data[i][4].match(prefixRegex)){
			// Create new elements in the DOM to output errors
			let node = document.createElement("li");
			node.innerHTML = "Invoice " + invoicesProcessed.data[i][4] + " in file " + fileInput.files[0].name + " - No Divisional Prefix at line " + (i + 1) + "<br><em>Invoice Line: " + invoicesProcessed.data[i].join("|") + "</em>"; 
			invoiceErrors.appendChild(node);
		}
	}
}

// Description Length
// Invoice Field [11]
function descriptionLength(){
	// Description is greater than 180 chars
	for(let i=0; i < invoicesProcessed.data.length; i++){
		if(invoicesProcessed.data[i][11].length > 180){
			// Create new elements in the DOM to output errors
			let node = document.createElement("li");
			node.innerHTML = "Invoice " + invoicesProcessed.data[i][4] + " in file " + fileInput.files[0].name + " - Description too long at line " + (i + 1) + "<br><em>Invoice Line: " + invoicesProcessed.data[i].join("|") + "</em>"; 
			invoiceErrors.appendChild(node);
		}
		
		if(invoicesProcessed.data[i][11] == ""){
			// Create new elements in the DOM to output errors
			let node = document.createElement("li");
			node.innerHTML = "Invoice " + invoicesProcessed.data[i][4] + " in file " + fileInput.files[0].name + " - Description null at line " + (i + 1) + "<br><em>Invoice Line: " + invoicesProcessed.data[i].join("|") + "</em>"; 
			invoiceErrors.appendChild(node);
		}

	}
}

// Tax Code
// Invoice Field [13]
function hasTaxCode(){
	for(let i=0; i < invoicesProcessed.data.length; i++){
		// No VAT Rate added
		if(!invoicesProcessed.data[i][13]){
			// Create new elements in the DOM to output errors
			let node = document.createElement("li");
			node.innerHTML = "Invoice " + invoicesProcessed.data[i][4] + " in file " + fileInput.files[0].name + " - No Tax Code at line " + (i + 1) + "<br><em>Invoice Line: " + invoicesProcessed.data[i].join("|") + "</em>"; 
			invoiceErrors.appendChild(node);
		}
	}
}

// Tax Value
// Invoice Field [14]
function taxValue(){
	for(let i=0; i < invoicesProcessed.data.length; i++){
		// If there is no tax whilst there is value
		if(invoicesProcessed.data[i][14] == "0.00" && invoicesProcessed.data[i][12] != "0.00"){
			// Create new elements in the DOM to output errors
			let node = document.createElement("li");
			node.innerHTML = "Invoice " + invoicesProcessed.data[i][4] + " in file " + fileInput.files[0].name + " - Zero Tax Value at line " + (i + 1) + "<br><em>Invoice Line: " + invoicesProcessed.data[i].join("|") + "</em>"; 
			invoiceErrors.appendChild(node);
		}
	}
}


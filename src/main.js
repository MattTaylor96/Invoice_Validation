// Declare variables for use
var fileInput = document.getElementById("file-input"); // Invoice file uploaded
var customerInput = document.getElementById("customer-input"); // Customer file uploaded
var invoicesProcessed; // Invoices in JSON format
var customersProcessed; // Customers in JSON format
var customerID = []; // Array to store customer IDs 
var customerAddressID = []; // Array to store customer address IDs
var invoiceOutput = document.getElementById("invoice-output"); // HTML element for displaying invoice lines
var invoiceErrors = document.getElementById("errors"); // HTML element for displaying invoice errors

// On customer file upload...
function submitCustomers(){
	// If no file is entered...
	if(!customerInput.files[0]){
		// Alert and return to stop errors
		alert("No File Uploaded");
		return
	}
	// Parse customer data (PapaParse)
	Papa.parse(customerInput.files[0], {
		// PapaParse config - callback for results
		complete: function(results) {
			// Store JSON in variable and allocate
			customersProcessed = results;
			allocateCustomers();
			// Create new elements in the DOM to show files
			let node = document.createElement("li");
			node.innerHTML = customerInput.files[0].name; 
			document.getElementById("customer-files").appendChild(node);
		}
	});
}

// On invoice file upload...
function submitFile(){
	// If no file is entered...
	if(!fileInput.files[0]){
		// Alert and return to prevent errors
		alert("No File Uploaded");
		return
	}
	// If no customer file is entered...
	if(!customerInput.files[0]){
		// Alert and return to prevent errors
		alert("Please upload a customer file first")
		return
	}
	// Parse the data (return through a callback due to asynchronous parsing)
	Papa.parse(fileInput.files[0], {
		complete: function(results) {
			// Output invoice lines and validate data
			invoicesProcessed = results;
			outputInvoices();
			outputErrors();			
			// Create new elements in the DOM to show files
			let node = document.createElement("li");
			node.innerHTML = fileInput.files[0].name; 
			document.getElementById("invoice-files").appendChild(node);
		}
	});	
}

// Remove all invoice data from the page
function clearPage(){
	// Determine last children of elements
	let x = document.getElementById("invoice-output");
	let y = document.getElementById("errors");
	let xChild = x.lastElementChild;
	let yChild = y.lastElementChild;
	// While there is a child element...
	while(xChild){
		x.removeChild(xChild);
		// Set new element as last child
		xChild = x.lastElementChild;
	}
	// While there is a child element...
	while(yChild){
		y.removeChild(yChild);
		// Set new element as last child
		yChild = y.lastElementChild;
	}
}

// Toggle display on invoice lines
function hideLines(){
	invoiceOutput.classList.toggle("hidden");
}


function allocateCustomers(){
	for(let i = 0; i < customersProcessed.data.length; i++){
		// Move Customer reference into array if it doesn't already exist
		if(customerID.indexOf(customersProcessed.data[i][1]) < 0){
			customerID.push(customersProcessed.data[i][1]);;
		}
		// Move Office reference into array if it doesn't already exist
		if(customerAddressID.indexOf(customersProcessed.data[i][4]) < 0){
			customerAddressID.push(customersProcessed.data[i][4]);
		}
	}
}

function outputInvoices(){
	// Compile each invoice line into a variable
	let invoiceLine = "";
	for(let i = 0; i < invoicesProcessed.data.length; i++){
		// Join array with original delimiter for readability
		invoiceLine = invoicesProcessed.data[i].join("|");
		// Create new elements in the DOM to output all invoice lines
		let node = document.createElement("li");
		node.innerHTML = invoiceLine;
		invoiceOutput.appendChild(node);
	}
	
}

// Validate invoice data
function outputErrors(){
	hasCostCode();
	doesClientExist();
	doesOfficeExist();
	hasInvoicePrefix();
	descriptionLength();
	hasTaxCode();
	taxValue();
}

// Does Client Exist
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

// Does Office Exist
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
			// Add 3 temporary fields to the array to prevent further errors
			for(let y = 0; y < 3; y++){
				invoicesProcessed.data[i].splice(6, 0, "");
			}
		}
	}	
}

// Has Invoice Prefix (Invoice should be prefixed with 5 characters)
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
	// Description is greater than 180 characters
	for(let i=0; i < invoicesProcessed.data.length; i++){
		if(invoicesProcessed.data[i][11].length > 180){
			// Create new elements in the DOM to output errors
			let node = document.createElement("li");
			node.innerHTML = "Invoice " + invoicesProcessed.data[i][4] + " in file " + fileInput.files[0].name + " - Description too long at line " + (i + 1) + "<br><em>Invoice Line: " + invoicesProcessed.data[i].join("|") + "</em>"; 
			invoiceErrors.appendChild(node);
		}
		// Description is blank
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

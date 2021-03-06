// Declare variables for use
var fileInput = document.getElementById("file-input"); // Invoice file uploaded
var customerInput = document.getElementById("customer-input"); // Customer file uploaded
var invoicesProcessed; // Invoices in JSON format
var customersProcessed; // Customers in JSON format
var customerID = JSON.parse(localStorage.getItem("customerIDs")); // Array to store customer IDs 
var customerAddressID = JSON.parse(localStorage.getItem("addressIDs")); // Array to store customer address IDs
var invoiceOutput = document.getElementById("invoice-output"); // HTML element for displaying invoice lines
var invoiceErrors = document.getElementById("errors"); // HTML element for displaying invoice errors
var errorsExport = []; // Array to store errors for export
var count = 1; // Counter for invoice output

// Check whether there is a value in local storage
if(!customerID){
	customerID = [];
}

// Check whether there is a value in local storage
if(!customerAddressID){
	// Define blank array
	customerAddressID = [];
}

// Timestamp functionality for export
function timestamp(){
	// Timestamp the export
	let date = new Date();
	let month = date.getMonth() + 1;
	if(month < 10){
		month = "0" + month;
	}
	date = date.toString();
	date = date.split(" ");
	date = date[2] + month + date[3] + date[4].split(":").join("");
	return date;
}

// When export button is clicked...
function exportErrors(filename, text){
	// Timestamp the export
	let date = timestamp();
	// create new "a" element to trigger download
	let element = document.createElement("a");
	element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
	element.setAttribute("download", filename + date + ".txt");
	// Hide anchor element
	element.style.display = "none";
	document.body.appendChild(element);
	// Trigger download
	element.click();
	// Delete anchor element
	document.body.removeChild(element);
}

// On customer file upload...
function submitCustomers(){
	// If no file is entered...
	if(!customerInput.files[0]){
		// Alert and return to stop errors
		alert("No File Uploaded");
		return;
	}
	// For each customer file
	for(let a = 0; a < customerInput.files.length; a++){
		// Parse customer data (PapaParse)
		Papa.parse(customerInput.files[a], {
			// PapaParse config - callback for results
			delimiter: "|",
			complete: function(results) {
				// Store JSON in variable and allocate
				customersProcessed = results;
				console.log(customersProcessed);
				allocateCustomers();
				// Create new elements in the DOM to show files
				let node = document.createElement("li");
				node.innerHTML = customerInput.files[a].name; 
				document.getElementById("customer-files").appendChild(node);
			}
		});
	}	
}

// On invoice file upload...
function submitFile(){
	// If no file is entered...
	if(!fileInput.files[0]){
		// Alert and return to prevent errors
		alert("No File Uploaded");
		return;
	}
	// If no customer file is entered...
	if(!customerInput.files[0]){
		if(customerID.length < 1){
			// Alert and return to prevent errors
			console.log(customerID);
			alert("No customers in the database. Please upload a customer file first");
			return;
		}
	}
	for(let a = 0; a < fileInput.files.length; a++){
		// Parse the data (return through a callback due to asynchronous parsing)
		Papa.parse(fileInput.files[a], {
			delimiter: "|",
			complete: function(results) {
				// Output invoice lines and validate data
				invoicesProcessed = results;
				outputInvoices();
				outputErrors(a);			
				// Create new elements in the DOM to show files
				let node = document.createElement("li");
				node.innerHTML = fileInput.files[a].name; 
				document.getElementById("invoice-files").appendChild(node);
			}
		});	
	}
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
			customerID.push(customersProcessed.data[i][1]);
		}
		// Move Office reference into array if it doesn't already exist
		if(customerAddressID.indexOf(customersProcessed.data[i][4]) < 0){
			customerAddressID.push(customersProcessed.data[i][4]);
		}
		// Store data in local storage
		localStorage.setItem("customerIDs", JSON.stringify(customerID));
		localStorage.setItem("addressIDs", JSON.stringify(customerAddressID));
	}
}

function outputInvoices(){
	// Compile each invoice line into a variable
	let invoiceLine = "";
	for(let i = 0; i < invoicesProcessed.data.length; i++){
		// Join array with original delimiter for readability
		invoiceLine = invoicesProcessed.data[i].join("|");
		// Create a new row in the table
		let row = invoiceOutput.insertRow();
		let firstCell = row.insertCell(0);
		let secondCell = row.insertCell(1);
		// Assign cell value
		firstCell.innerHTML = count;
		secondCell.innerHTML = invoiceLine;
		// increment counter
		count ++;
	}
}

// Validate invoice data (pass file down for error outputs)
function outputErrors(file){
	hasCostCode(file);
	doesClientExist(file);
	doesOfficeExist(file);
	hasInvoicePrefix(file);
	descriptionLength(file);
	invoiceValue(file);
	hasTaxCode(file);
	taxValue(file);
	hasExtraDelimiter(file);
	//markupCharacter(file);
}

// Does Client Exist
// Invoice Field 2 [1]
function doesClientExist(file){
	for(let i = 0; i < invoicesProcessed.data.length; i++){
		if(customerID.indexOf(invoicesProcessed.data[i][1]) < 0){
			// Print the error
			errorFound(invoicesProcessed.data[i][4], "No customer in Oracle", (i + 1), fileInput.files[file].name, invoicesProcessed.data[i].join("|"));
		}
	}
}

// Does Office Exist
// Invoice Field 4 [3]
function doesOfficeExist(file){
	for(let i = 0; i < invoicesProcessed.data.length; i++){
		if(customerAddressID.indexOf(invoicesProcessed.data[i][3]) < 0){
			// Print the error
			errorFound(invoicesProcessed.data[i][4], "No customer office", (i + 1), fileInput.files[file].name, invoicesProcessed.data[i].join("|"));
		}
	}
}

// Is Cost Code Valid
// Invoice Field 7 [6]
function hasCostCode(file){	
	for(let i=0; i < invoicesProcessed.data.length; i++){
		if(invoicesProcessed.data[i].length < 16){
			// Print the error
			errorFound(invoicesProcessed.data[i][4], "No Cost Code at line", (i + 1), fileInput.files[file].name, invoicesProcessed.data[i].join("|"));
			// Add 3 temporary fields to the array to prevent further errors
			for(let y = 0; y < 3; y++){
				invoicesProcessed.data[i].splice(6, 0, "");
			}
		}
	}	
}

// Has Invoice Prefix (Invoice should be prefixed with 5 characters)
// Invoice Field 5 [4]
function hasInvoicePrefix(file){
	for(let i = 0; i < invoicesProcessed.data.length; i++){
		// Use Regex to verify string starts with 5 characters
		var prefixRegex = /^[a-z][a-z][a-z][a-z][a-z]/i;
		if(!invoicesProcessed.data[i][4].match(prefixRegex)){
			// Print the error
			errorFound(invoicesProcessed.data[i][4], "No Divisional Prefix", (i + 1), fileInput.files[file].name, invoicesProcessed.data[i].join("|"));
		}
	}
}

// Description Length
// Invoice Field [11]
function descriptionLength(file){
	// Description is greater than 240 characters
	for(let i=0; i < invoicesProcessed.data.length; i++){
		if(invoicesProcessed.data[i][11].length > 240){
			// Print the error
			errorFound(invoicesProcessed.data[i][4], "Description too long", (i + 1), fileInput.files[file].name, invoicesProcessed.data[i].join("|"));
		}
		// Description is blank
		if(invoicesProcessed.data[i][11] == ""){
			// Print the error
			errorFound(invoicesProcessed.data[i][4], "Description is null", (i + 1), fileInput.files[file].name, invoicesProcessed.data[i].join("|"));
		}
	}
}

// Negative Invoice Value
function invoiceValue(file){
	// Invoice is negative
	for(let i = 0; i < invoicesProcessed.data.length; i++){
		if(invoicesProcessed.data[i][12] < 0){
			// Print the error	
			errorFound(invoicesProcessed.data[i][4], "Negative Value", (i + 1), fileInput.files[file].name, invoicesProcessed.data[i].join("|"));
		}
	}
}

// Tax Code
function hasTaxCode(file){
	for(let i=0; i < invoicesProcessed.data.length; i++){
		// No VAT Rate added
		if(!invoicesProcessed.data[i][13]){
			// Print the error
			errorFound(invoicesProcessed.data[i][4], "No tax code", (i + 1), fileInput.files[file].name, invoicesProcessed.data[i].join("|"));
		}
	}
}

// Tax Value
function taxValue(file){
	for(let i=0; i < invoicesProcessed.data.length; i++){
		/* Removed for optimisation - see RegEx below
		// If there is no tax whilst there is value
		if(invoicesProcessed.data[i][14] == "0.00" && invoicesProcessed.data[i][12] != "0.00"){
			// Print the error
			errorFound(invoicesProcessed.data[i][4], "Zero tax value", (i + 1), fileInput.files[file].name, invoicesProcessed.data[i].join("|"));
		}
		*/
		// If there is tax against a null tax rate
		var nullTaxRates = /Exempt|Outside|Zero/i;
		if(nullTaxRates.test(invoicesProcessed.data[i][13]) == true && invoicesProcessed.data[i][14] != "0.00" ){
			errorFound(invoicesProcessed.data[i][4], "Incorrect Tax Code", (i + 1), fileInput.files[file].name, invoicesProcessed.data[i].join("|"));
		}
		// If there is a tax rate and invoice value, but no tax
		if(nullTaxRates.test(invoicesProcessed.data[i][13]) == false && invoicesProcessed.data[i][14] == "0.00" && invoicesProcessed.data[i][12] != "0.00"){
			errorFound(invoicesProcessed.data[i][4], "Zero Tax Value", (i + 1), fileInput.files[file].name, invoicesProcessed.data[i].join("|"));
		}
	}
}

// Extra Delimiters
function hasExtraDelimiter(file){
	for(let i = 0; i < invoicesProcessed.data.length; i++)
	{
		// If there are too many delimiters (delimiters included in description field)
		if(invoicesProcessed.data[i].length > 16){
			errorFound(invoicesProcessed.data[i][4], "Too many delimiters in record", (i + 1), fileInput.files[file].name, invoicesProcessed.data[i].join("|"));
		}
	}
}

// Markup Characters
// Code no longer necessary - Kept for potential future use...
/*
function markupCharacter(file){
	for(let i = 0; i < invoicesProcessed.data.length; i++){
		// Outline regularly occuring entities (params to test)
		var markupChars = /<br>|&nbsp;|&amp;|;/i;
		// If description contains any markupChars...
		if(markupChars.test(invoicesProcessed.data[i][11])){
			errorFound(invoicesProcessed.data[i][4], "HTML Characters Used in Line", (i + 1), fileInput.files[file].name, invoicesProcessed.data[i].join("|"));
		}
	}
}
*/

// Print errors
function errorFound(invoiceRef, errorReason, errorLine, fileName, invoiceLine){
	// Create a new row in the table
	let row = invoiceErrors.insertRow();
	let firstCell = row.insertCell(0);
	let secondCell = row.insertCell(1);
	let thirdCell = row.insertCell(2);
	let fourthCell = row.insertCell(3);
	let fifthCell = row.insertCell(4);
	// Assign cell value
	firstCell.innerHTML = invoiceRef;
	secondCell.innerHTML = errorReason;
	thirdCell.innerHTML = errorLine;
	fourthCell.innerHTML = fileName;
	fifthCell.innerHTML = invoiceLine;
	// Add failed invoice line to export array
	errorsExport.push("Invoice " + invoiceRef + " in file " + fileName + " - " + errorReason + " at line " + errorLine + "\n Invoice Line: " + invoiceLine + " \n");
}
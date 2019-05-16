# Invoice_Validation
This project was created for use in a company which extracts invoice lines in .csv files form an external system.

Each invoice line must meet specific criteria before it is transferred into the accounting software. This application allows the user to upload a customer database, and then upload a number of invoice files to validate the output.

The application will flag any errors, stating the name of the file they occur in, the line they occur on and a description of the error.

The appliation uses PapaParse (https://github.com/mholt/PapaParse) to convert the .csv values to JSON, and main.js to conduct tests on each line converted.

// Declare variables
var instructionBtn = document.getElementById('instruction-btn');
var instructionBox = document.getElementById('instructions');

// On button click, toggle 'hidden' class on instructions
instructionBtn.addEventListener("click", function(){
	instructionBox.classList.toggle("hidden");
});
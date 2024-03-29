const word = document.getElementById("word")
const input = document.getElementById("input")
const feedback = document.getElementById("feedback")
const result = document.getElementById("result")
const again = document.getElementById("again")
const change_list = document.getElementById("change_list")
const end_buttons = document.getElementById("end_buttons")
const progressBar = document.getElementById("progress-bar");
const progress = document.getElementById("progress");
const tableBody = document.getElementById('logTableBody');
const tableContainer = document.getElementById('logTableContainer');

// Declare variables
let vortoj = []
let word_list = []
let current_word_index = 0;
let score = 0;
let score_max = 50;
let maxList = 0; // the number of lists

let rep = 3  // repeat word after rep words
let listNumber = 0  // list number
let determinants = ["le", "la"]
let Interface = "start"
let prog = 0; // Start with a progress of 0
let canProgress = true; // indicates whether progress should be counted when the word is correct


// Function to load the JSON data from a local file
function loadJSONFile(file, callback) {
    console.log("loadJSONFile (line )") // TODO: remove
    const xhr = new XMLHttpRequest();
    xhr.overrideMimeType("application/json");
    xhr.open("GET", file, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            callback(xhr.responseText);
        } else if (xhr.readyState === 4) {
            callback(null);
        }
    };
    xhr.send(null);
}

function fetchQuestions() {
    console.log("fetchQuestions (line )") // TODO: remove
    // Load the questions from the local JSON file
    loadJSONFile("vortoj.json", function (data) {
        if (data) {
            vortoj = JSON.parse(data);
            // displayQuestion();
        } else {
            // If no data is found, show a message to the user to add questions manually
            questionElem.textContent = "Please add questions manually in the JSON format.";
        }
    });
}


// This function changes the interface to ask the user for a list number
function askForList() {
    console.log("askForList (line )") // TODO: remove
    Interface = "askForList"
    word.style.display = "block"
    word.textContent = "Choose a list"
    input.style.display = "block"
    input.addEventListener("keydown", listHandler);
    end_buttons.style.display = "none" // originally in the function d_or_s
    progressBar.style.display = "none" // originally in the function d_or_s

    showLogs() // Show a list of logs
}


// This function checks if the input is a valid number and then
// calls set_list() to define the list and quiz() to start the quiz
function listHandler(e) {
    console.log("listHandler (line )") // TODO: remove
    if (e.key === "Enter") {
        maxList = vortoj.length
        console.log(`the length of the 'lists' object is ${maxList}`)
        while (true) { // while the input is not an existing list number
            listNumber = parseInt(input.value); // the number entered is treated as the number of the desired list
            if (listNumber <= maxList && listNumber > 0) {
                break; // exit loop if valid input
            }
            feedback.style.color = "red";
            feedback.textContent = `The maximum list number is ${maxList}! Enter a number between 1 and ${maxList}.`;
            input.value = "";
            return;
        }
        input.value = "" // clear text in text box
        feedback.textContent = ""; // clear feedback
        input.removeEventListener("keydown", listHandler);
        set_list(listNumber);
        // word.textContent = "enter"
        quiz();
    }
}


function shuffleArray(array) {
    console.log("shuffleArray (line )") // TODO: remove
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// this function defines the list and score_max
function set_list(num) {
    console.log("set_list (line )") // TODO: remove
    let originalList = vortoj[num-1];
    word_list = JSON.parse(JSON.stringify(originalList)); // Deep copy the list
    shuffleArray(word_list) // TODO: install library ?
    score_max = word_list.length
    for (let i = 0; i < score_max; i++) {
        word_list[i] = [word_list[i][0], word_list[i][1], false]
    }
}

// This function changes the interface to start the quiz
function quiz() {
    console.log("Quiz time (line )") // TODO: remove
    Interface = "quiz"
    word.style.display = "block"
    input.style.display = "block"
    progressBar.style.display = "block" // show the progress bar
    updateProgressBar()
    word.textContent = word_list[current_word_index][0]
    input.addEventListener("keydown", enterHandler)
    tableContainer.style.display = "none" // Hide the table of logs
}

function enterHandler(e) {
    console.log("enterHandler (line )") // TODO: remove
    if (e.key === "Enter") {
        checkAnswer()
    }
}

function checkAnswer() {
    console.log("checkAnswer (line )") // TODO: remove
    let inp = input.value
    inp = standardizeApostrophes(inp)
    let answer = word_list[current_word_index][1]
    answer = standardizeApostrophes(answer)
    const shown = word_list[current_word_index][2]
    input.value = "" // clear text in text box
    if (inp === answer) { // User input is correct
        if (!shown) { // if the word has not been shown yet
            score++
        }
        current_word_index++
        if (canProgress) {
            prog++;
            updateProgressBar();
        } else {
            canProgress = true; // next word correct will count as progress
        }
        if (current_word_index >= word_list.length) { // end of list
            show_result()
        } else { // next word
            word.textContent = word_list[current_word_index][0]
            feedback.textContent = "correct!"
            feedback.style.color = "green"
            setTimeout(function () {
                feedback.textContent = "";
            }, 1000 ); // appears for one second
        }
    } else if (inp === "?") {
        input.disabled = true; // disable text box
        setTimeout(function () {
            input.disabled = false;
        }, 4000); // re-enable it after 4 seconds
        word_list[current_word_index][2] = true // answer has been shown
        // add word later in list
        word_list.splice(current_word_index + rep, 0, word_list[current_word_index])
        console.log(word_list) // show word list in console for debugging
        feedback.textContent = word_list[current_word_index][1] // show answer
        feedback.style.color = "pink" // in blue
        canProgress = false; // will not count progress when word is correct, because it will reappear later
        setTimeout(function () {
            feedback.textContent = "";
        }, 4000 ); // appears for four seconds
    } else {
        // User input is incorrect
        const split_1 = inp.split(' ')
        const split_2 = answer.split(' ')
        feedback.style.color = "red"
        setTimeout(function () {
            feedback.textContent = "";
        }, 1000 ); // appears for one second
        if ((split_1.length === split_2.length) &&
            (determinants.includes(split_1[0])) &&
            (determinants.includes(split_2[0])) &&
            (split_1[0] !== split_2[0])) {
            feedback.textContent = "incorrect gender"
        }
        else if (inp.split(' ').join('') === answer.split(' ').join('')) { //everything is correct except spaces
            feedback.textContent = "Careful with spaces!"
        }
        else if (inp.toLowerCase() === answer.toLowerCase()) { //everything is correct except the case (capital letters)
            feedback.textContent = "Case sensitive!"
        }
        else if (inp.split(' ').join('').toLowerCase() === answer.split(' ').join('').toLowerCase()) {
            feedback.textContent = "Careful with spaces and case sensitivity!"
        }
        else {
            feedback.textContent = "Try again"
        }
    }
}

function updateProgressBar() {
    // Convert the progress from a scale of 0-20 to 0-100%
    let percentage = (prog / score_max) * 100;
    progress.style.width = percentage + "%";
}

function show_result() {

    saveLog(listNumber, score, score_max); // record activity in local storage

    Interface = "end"
    word.style.display = "none"
    input.removeEventListener("keydown", enterHandler)
    input.style.display = "none"
    result.style.display = "block"
    result.textContent = `Score: ${score}/${score_max}`
    end_buttons.style.display = "block"

    again.textContent = "start again"
    again.addEventListener("click", startAgain)

    change_list.textContent = "change list"
    change_list.addEventListener("click", changeList)

    progressBar.style.display = "none" // hide the progress bar
    prog = 0; // restart the progress from 0

    showLogs() // Show previously completed lists

    current_word_index = 0
    score = 0
    word_list = []
}

function startAgain() {
    console.log("Starting again (line )") // TODO: remove
    collapseMenu()
    set_list(listNumber)
    quiz()
}

function changeList() {
    console.log("changeList (line )") // TODO: remove
    collapseMenu()
    askForList()
}

function collapseMenu() {
    console.log("collapseMenu (line )") // TODO: remove
    result.style.display = "none"
    end_buttons.style.display = "none"
    tableContainer.style.display = "none"
}


function saveLog(listNumber, score, scoreMax) {
    // Create a new log entry
    const newLog = { date: new Date(), listNumber: listNumber, score: score , scoreMax: scoreMax};

    // Retrieve the existing logs (if any)
    const existingLogs = JSON.parse(localStorage.getItem('logs')) || [];

    existingLogs.push(newLog); // Add the new log to the array

    localStorage.setItem('logs', JSON.stringify(existingLogs)); // Save the updated array back to Local Storage
}

function showLogs() {
    // Retrieve and return the logs
    const logs = JSON.parse(localStorage.getItem('logs')) || [];
    tableContainer.style.display = logs.length ? 'block' : 'none'; // Hide the table if there are no logs
    tableBody.innerHTML = ''; // Clear existing entries

    logs.reverse().forEach(log => {
        const row = tableBody.insertRow();
        const dateCell = row.insertCell(0);
        const listCell = row.insertCell(1);
        const scoreCell = row.insertCell(2);

        dateCell.textContent = new Date(log.date).toLocaleString();
        listCell.textContent = log.listNumber;
        scoreCell.textContent = log.score + '/' + log.scoreMax;
    });
}

function standardizeApostrophes(str) {
    let result = str.replace(/[\u2018\u2019\u00B4\u0060]/g, "\u0027");
    result = result.replace(/\.{3}/g, "\u2026");
    return result
}


// Initialise the quiz:
fetchQuestions()
askForList()
// script.js

let gameData = {};
let currentNode = {};
let gameState = {};

// Function to load the JSON data
function loadGameData() {
    fetch('ecoquest_game.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            gameData = data;
            startGame();
        })
        .catch(error => {
            console.error('Error loading game data:', error);
            displayError('Failed to load game data. Please try again later.');
        });
}

// Function to start or restart the game
function startGame() {
    gameState = {}; // Reset game state
    currentNode = getNodeById('N1'); // Start at the initial node
    displayNode();
}

// Function to retrieve a node by its ID
function getNodeById(nodeId) {
    const node = gameData.nodes.find(n => n.node_id === nodeId);
    if (!node) {
        console.error(`Node with ID ${nodeId} not found.`);
        displayError(`An error occurred: Node ${nodeId} not found.`);
    }
    return node;
}

// Function to display the current node
function displayNode() {
    const scenarioDiv = document.getElementById('scenario');
    const choicesDiv = document.getElementById('choices');
    const outcomeDiv = document.getElementById('outcome');
    const restartButton = document.getElementById('restart-button');

    // Clear previous content
    scenarioDiv.innerHTML = '';
    choicesDiv.innerHTML = '';
    outcomeDiv.innerHTML = '';
    restartButton.style.display = 'none';

    if (!currentNode) {
        return; // If currentNode is undefined due to an error, exit early
    }

    if (currentNode.outcome) {
        // Terminal node: display outcome with success score
        outcomeDiv.textContent = currentNode.outcome;
        restartButton.style.display = 'inline-block';
        restartButton.onclick = startGame;
    } else if (currentNode.scenario && currentNode.choices) {
        // Decision node: display scenario and choices

        // Modify scenario based on state variables if needed (optional)
        let scenarioText = currentNode.scenario;

        // Display the scenario
        scenarioDiv.textContent = scenarioText;

        // Create and append choice buttons
        currentNode.choices.forEach(choice => {
            const button = document.createElement('button');
            button.textContent = choice.description;
            button.className = 'choice-button';
            button.onclick = () => handleChoice(choice);
            choicesDiv.appendChild(button);
        });
    } else {
        // Handle unexpected node structure
        displayError('An unexpected error occurred in the game structure.');
    }
}

// Function to handle a player's choice
function handleChoice(choice) {
    // Update game state based on the choice
    if (choice.state_updates) {
        for (let [key, value] of Object.entries(choice.state_updates)) {
            gameState[key] = value;
        }
    }

    // Move to the next node
    const nextNode = getNodeById(choice.next_id);
    if (nextNode) {
        currentNode = nextNode;
        displayNode();
    } else {
        // If the next node doesn't exist, display an error
        displayError(`The next node (${choice.next_id}) does not exist.`);
    }
}

// Function to display error messages to the user
function displayError(message) {
    const scenarioDiv = document.getElementById('scenario');
    const choicesDiv = document.getElementById('choices');
    const outcomeDiv = document.getElementById('outcome');
    const restartButton = document.getElementById('restart-button');

    scenarioDiv.innerHTML = '';
    choicesDiv.innerHTML = '';
    outcomeDiv.textContent = message;
    restartButton.style.display = 'inline-block';
    restartButton.textContent = 'Restart Game';
    restartButton.onclick = startGame;
}

// Initialize the game when the window loads
window.onload = loadGameData;


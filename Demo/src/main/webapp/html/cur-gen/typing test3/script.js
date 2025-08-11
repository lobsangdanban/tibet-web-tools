// Sample Tibetan text for typing test
const sampleTexts = [
    "བཀྲ་ཤིས་བདེ་ལེགས། ང་ཚོ་དེ་རིང་བཀྲ་ཤིས་བདེ་ལེགས་ཀྱི་ཚེས་བཅུ་ཉེར་ལྔ་ཆག་ཚོས་དགའ་སྟོན་བྱེད་ཀྱི་ཡོད།",
    "བོད་ཡིག་ནི་བོད་ཀྱི་རིག་གཞུང་གཙོ་བོ་ཞིག་ཡིན་པ་དང་། དེ་ནི་བོད་མི་ཚོས་ཡུལ་ཕྱོགས་ཀྱི་རིག་གཞུང་དང་ཤེས་རིག་ཉར་ཚགས་བྱེད་པའི་ཐབས་ཤེས་གཙོ་བོ་ཞིག་ཡིན།",
    "དེང་དུས་ཀྱི་དྲི་བ་དང་ཉེན་ཁ་ཚོ་ཚང་མ་ཡོངས་སུ་ཤེས་རིག་གི་ཐོག་ནས་ཐག་གཅོད་བྱེད་དགོས་ཀྱི་ཡོད།"
];

let currentText = "";
let startTime = null;
let timerInterval = null;
let isTestActive = false;

// DOM Elements
const startButton = document.getElementById('startTest');
const timerDisplay = document.getElementById('timer');
const sampleTextDisplay = document.getElementById('sampleText');
const userInput = document.getElementById('userInput');
const resultsSection = document.querySelector('.results-section');
const timeResult = document.getElementById('timeResult');
const speedResult = document.getElementById('speedResult');
const errorRate = document.getElementById('errorRate');
const errorList = document.getElementById('errorList');
const characterList = document.getElementById('characterList');
const saveStatsButton = document.getElementById('saveStats');

// Initialize the test
function initTest() {
    currentText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    sampleTextDisplay.textContent = currentText;
    userInput.textContent = '';
    userInput.contentEditable = false;
    resultsSection.style.display = 'none';
    startButton.textContent = 'བརྟག་ཚོད་འགོ་འཛུགས་';
    timerDisplay.textContent = '00:00';
    isTestActive = false;
}

// Start the test
function startTest() {
    if (!isTestActive) {
        isTestActive = true;
        startTime = Date.now();
        userInput.contentEditable = true;
        userInput.focus();
        startButton.textContent = 'བརྟག་ཚོད་འགོ་འཛུགས་';
        timerInterval = setInterval(updateTimer, 1000);
    } else {
        initTest();
    }
}

// Update timer display
function updateTimer() {
    if (!isTestActive) return;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Check input and update colors
function checkInput() {
    if (!isTestActive) return;
    
    const userText = userInput.textContent;
    const sampleText = currentText;
    
    // Clear previous content
    userInput.innerHTML = '';
    
    // Compare each character and add appropriate color
    for (let i = 0; i < Math.max(userText.length, sampleText.length); i++) {
        const span = document.createElement('span');
        if (i < userText.length) {
            if (i < sampleText.length && userText[i] === sampleText[i]) {
                span.className = 'correct';
                span.textContent = userText[i];
            } else {
                span.className = 'incorrect';
                span.textContent = userText[i];
            }
        } else if (i < sampleText.length) {
            span.className = 'incorrect';
            span.textContent = ' ';
        }
        userInput.appendChild(span);
    }
    
    // Check if test is complete
    if (userText.length === sampleText.length) {
        endTest();
    }
}

// End the test and calculate results
function endTest() {
    clearInterval(timerInterval);
    userInput.contentEditable = false;
    isTestActive = false;
    startButton.textContent = 'བརྟག་ཚོད་འགོ་འཛུགས་';
    
    const userText = userInput.textContent;
    const timeElapsed = (Date.now() - startTime) / 1000;
    const errors = calculateErrors(currentText, userText);
    const speed = calculateSpeed(userText.length, timeElapsed);
    const errorRateValue = calculateErrorRate(errors, currentText.length);
    
    displayResults(timeElapsed, speed, errorRateValue, errors);
    analyzeCharacters(userText);
}

// Calculate typing errors
function calculateErrors(original, typed) {
    let errors = 0;
    for (let i = 0; i < Math.min(original.length, typed.length); i++) {
        if (original[i] !== typed[i]) {
            errors++;
        }
    }
    return errors + Math.abs(original.length - typed.length);
}

// Calculate typing speed (characters per minute)
function calculateSpeed(charCount, timeInSeconds) {
    return Math.round((charCount / timeInSeconds) * 60);
}

// Calculate error rate
function calculateErrorRate(errors, totalChars) {
    return ((errors / totalChars) * 100).toFixed(2);
}

// Display results
function displayResults(time, speed, errorRateValue, errors) {
    resultsSection.style.display = 'block';
    timeResult.textContent = time.toFixed(1);
    speedResult.textContent = speed;
    errorRate.textContent = errorRateValue;
    
    // Display error analysis
    errorList.innerHTML = '';
    const errorChars = {};
    for (let i = 0; i < Math.min(currentText.length, userInput.textContent.length); i++) {
        if (currentText[i] !== userInput.textContent[i]) {
            const char = userInput.textContent[i] || 'མེད་པ།';
            errorChars[char] = (errorChars[char] || 0) + 1;
        }
    }
    
    Object.entries(errorChars).forEach(([char, count]) => {
        const errorItem = document.createElement('div');
        errorItem.className = 'error-item';
        errorItem.textContent = `${char}: ${count}`;
        errorList.appendChild(errorItem);
    });
}

// Analyze character frequency
function analyzeCharacters(text) {
    characterList.innerHTML = '';
    const charCount = {};
    
    for (const char of text) {
        charCount[char] = (charCount[char] || 0) + 1;
    }
    
    Object.entries(charCount)
        .sort((a, b) => b[1] - a[1])
        .forEach(([char, count]) => {
            const charItem = document.createElement('div');
            charItem.className = 'character-item';
            charItem.textContent = `${char}: ${count}`;
            characterList.appendChild(charItem);
        });
}

// Save statistics to file
function saveStatistics() {
    const stats = {
        date: new Date().toLocaleString(),
        time: parseFloat(timeResult.textContent),
        speed: parseInt(speedResult.textContent),
        errorRate: parseFloat(errorRate.textContent),
        errors: Array.from(errorList.children).map(item => item.textContent),
        characters: Array.from(characterList.children).map(item => item.textContent)
    };
    
    const content = `
བརྟག་ཚོད་འབྲས་བུ།
==================
| ཞིབ་ཕྲ་ཚོད་ལྟ། | གཏོང་ཚད། |
|----------------|----------|
| དུས་ཚོད། | ${stats.date} |
| དུས་ཚོད། | ${stats.time} སྐར་མ། |
| འཇོག་ཚད། | ${stats.speed} ཡིག་ཚད།/སྐར་མ། |
| ནོར་ཚད། | ${stats.errorRate}% |
==================

ནོར་ཚད་ཞིབ་ཕྲ།:
${stats.errors.join('\n')}

ཡིག་ཚད་སྡོམ་རྩིས།:
${stats.characters.join('\n')}
==================
`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `typing_test_${new Date().toISOString().slice(0,19).replace(/[:]/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Event Listeners
startButton.addEventListener('click', startTest);
userInput.addEventListener('input', checkInput);
saveStatsButton.addEventListener('click', saveStatistics);

// Initialize the test when the page loads
initTest(); 
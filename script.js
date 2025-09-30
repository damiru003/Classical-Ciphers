// Classical Ciphers JavaScript Implementation
class ClassicalCiphers {
    
    // Helper function to clean text (uppercase, alphabetic only)
    static cleanText(text, keepSpaces = false) {
        let cleaned = '';
        for (let char of text) {
            if (/[a-zA-Z]/.test(char)) {
                cleaned += char.toUpperCase();
            } else if (keepSpaces && char === ' ') {
                cleaned += char;
            }
        }
        return cleaned;
    }

    // Helper function to validate alphabetic key
    static isValidAlphabeticKey(key) {
        return key && /^[a-zA-Z]+$/.test(key);
    }

    // Caesar/Shift Cipher
    static caesarEncrypt(plaintext, shift) {
        const cleaned = this.cleanText(plaintext);
        let result = '';
        
        shift = ((shift % 26) + 26) % 26; // Handle negative shifts
        
        for (let char of cleaned) {
            const charCode = char.charCodeAt(0) - 65;
            const encryptedCharCode = (charCode + shift) % 26;
            result += String.fromCharCode(encryptedCharCode + 65);
        }
        
        return result;
    }

    static caesarDecrypt(ciphertext, shift) {
        return this.caesarEncrypt(ciphertext, -shift);
    }

    // Vigenère Cipher
    static vigenereEncrypt(plaintext, key) {
        if (!this.isValidAlphabeticKey(key)) {
            throw new Error('Key must contain only alphabetic characters');
        }
        
        const cleanedText = this.cleanText(plaintext);
        const cleanedKey = this.cleanText(key);
        let result = '';
        
        if (cleanedKey.length === 0) {
            throw new Error('Key cannot be empty');
        }
        
        for (let i = 0; i < cleanedText.length; i++) {
            const textChar = cleanedText[i];
            const keyChar = cleanedKey[i % cleanedKey.length];
            
            const shift = keyChar.charCodeAt(0) - 65;
            const encryptedChar = String.fromCharCode(((textChar.charCodeAt(0) - 65 + shift) % 26) + 65);
            result += encryptedChar;
        }
        
        return result;
    }

    static vigenereDecrypt(ciphertext, key) {
        if (!this.isValidAlphabeticKey(key)) {
            throw new Error('Key must contain only alphabetic characters');
        }
        
        const cleanedText = this.cleanText(ciphertext);
        const cleanedKey = this.cleanText(key);
        let result = '';
        
        if (cleanedKey.length === 0) {
            throw new Error('Key cannot be empty');
        }
        
        for (let i = 0; i < cleanedText.length; i++) {
            const textChar = cleanedText[i];
            const keyChar = cleanedKey[i % cleanedKey.length];
            
            const shift = keyChar.charCodeAt(0) - 65;
            const decryptedChar = String.fromCharCode(((textChar.charCodeAt(0) - 65 - shift + 26) % 26) + 65);
            result += decryptedChar;
        }
        
        return result;
    }

    // Playfair Cipher
    static createPlayfairMatrix(key) {
        if (!this.isValidAlphabeticKey(key)) {
            throw new Error('Key must contain only alphabetic characters');
        }
        
        const cleanedKey = this.cleanText(key);
        const matrix = Array(5).fill().map(() => Array(5));
        const used = new Set();
        let keyString = '';
        
        // Add key characters (merge J->I)
        for (let char of cleanedKey) {
            if (char === 'J') char = 'I';
            if (!used.has(char)) {
                keyString += char;
                used.add(char);
            }
        }
        
        // Add remaining alphabet
        for (let i = 65; i <= 90; i++) {
            const char = String.fromCharCode(i);
            if (char === 'J') continue; // Skip J
            if (!used.has(char)) {
                keyString += char;
                used.add(char);
            }
        }
        
        // Fill matrix
        let index = 0;
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                matrix[i][j] = keyString[index++];
            }
        }
        
        return matrix;
    }

    static findPosition(matrix, char) {
        if (char === 'J') char = 'I';
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (matrix[i][j] === char) {
                    return [i, j];
                }
            }
        }
        return [-1, -1];
    }

    static preparePlayfairText(text) {
        let cleaned = this.cleanText(text);
        let prepared = '';
        
        // Replace J with I
        cleaned = cleaned.replace(/J/g, 'I');
        
        // Create digraphs
        for (let i = 0; i < cleaned.length; i++) {
            prepared += cleaned[i];
            
            // If next character is the same, insert X
            if (i + 1 < cleaned.length && cleaned[i] === cleaned[i + 1]) {
                prepared += 'X';
            }
        }
        
        // Pad with X if odd length
        if (prepared.length % 2 === 1) {
            prepared += 'X';
        }
        
        return prepared;
    }

    static playfairEncrypt(plaintext, key) {
        const matrix = this.createPlayfairMatrix(key);
        const prepared = this.preparePlayfairText(plaintext);
        let result = '';
        
        for (let i = 0; i < prepared.length; i += 2) {
            const first = prepared[i];
            const second = prepared[i + 1];
            
            const [row1, col1] = this.findPosition(matrix, first);
            const [row2, col2] = this.findPosition(matrix, second);
            
            if (row1 === row2) {
                // Same row - move right
                result += matrix[row1][(col1 + 1) % 5];
                result += matrix[row2][(col2 + 1) % 5];
            } else if (col1 === col2) {
                // Same column - move down
                result += matrix[(row1 + 1) % 5][col1];
                result += matrix[(row2 + 1) % 5][col2];
            } else {
                // Rectangle - swap columns
                result += matrix[row1][col2];
                result += matrix[row2][col1];
            }
        }
        
        return result;
    }

    static playfairDecrypt(ciphertext, key) {
        const matrix = this.createPlayfairMatrix(key);
        const cleaned = this.cleanText(ciphertext);
        let result = '';
        
        for (let i = 0; i < cleaned.length; i += 2) {
            const first = cleaned[i];
            const second = cleaned[i + 1];
            
            const [row1, col1] = this.findPosition(matrix, first);
            const [row2, col2] = this.findPosition(matrix, second);
            
            if (row1 === row2) {
                // Same row - move left
                result += matrix[row1][(col1 - 1 + 5) % 5];
                result += matrix[row2][(col2 - 1 + 5) % 5];
            } else if (col1 === col2) {
                // Same column - move up
                result += matrix[(row1 - 1 + 5) % 5][col1];
                result += matrix[(row2 - 1 + 5) % 5][col2];
            } else {
                // Rectangle - swap columns
                result += matrix[row1][col2];
                result += matrix[row2][col1];
            }
        }
        
        return result;
    }
}

// UI Controller
class UIController {
    constructor() {
        this.initializeEventListeners();
        this.showPanel('caesar');
    }

    initializeEventListeners() {
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const cipher = e.target.getAttribute('data-cipher');
                this.switchTab(cipher);
                this.showPanel(cipher);
            });
        });

        // Shift slider synchronization
        const shiftInput = document.getElementById('caesar-shift');
        const shiftSlider = document.getElementById('caesar-slider');
        
        shiftInput.addEventListener('input', (e) => {
            shiftSlider.value = e.target.value;
        });
        
        shiftSlider.addEventListener('input', (e) => {
            shiftInput.value = e.target.value;
        });

        // Real-time key visualization for Vigenère
        document.getElementById('vigenere-key').addEventListener('input', (e) => {
            this.updateVigenereVisualization(e.target.value);
        });

        // Real-time matrix update for Playfair
        document.getElementById('playfair-key').addEventListener('input', (e) => {
            this.updatePlayfairMatrix(e.target.value);
        });
    }

    switchTab(activeTab) {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-cipher="${activeTab}"]`).classList.add('active');
    }

    showPanel(panelName) {
        document.querySelectorAll('.cipher-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${panelName}-panel`).classList.add('active');
    }

    formatResult(text, chunkSize = 5) {
        return text.match(new RegExp(`.{1,${chunkSize}}`, 'g')).join(' ');
    }

    updateVigenereVisualization(key) {
        const visualization = document.getElementById('vigenere-visualization');
        
        if (!key.trim()) {
            visualization.innerHTML = '';
            return;
        }

        const cleanedKey = ClassicalCiphers.cleanText(key);
        
        visualization.innerHTML = `
            <div class="key-vis-title">
                <i class="fas fa-eye"></i> Key Pattern Visualization
            </div>
            <div class="key-pattern">
                ${cleanedKey.split('').map((char, index) => `<div class="key-char" style="--char-index: ${index}">${char}</div>`).join('')}
            </div>
        `;
    }

    updatePlayfairMatrix(key) {
        const matrixDisplay = document.getElementById('playfair-matrix');
        
        if (!key.trim()) {
            matrixDisplay.innerHTML = '';
            return;
        }

        try {
            const matrix = ClassicalCiphers.createPlayfairMatrix(key);
            
            let matrixHTML = `
                <div class="matrix-title">
                    <i class="fas fa-th"></i> 5×5 Playfair Key Matrix
                </div>
                <div class="matrix-grid">
            `;
            
            let cellIndex = 0;
            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 5; j++) {
                    matrixHTML += `<div class="matrix-cell" style="--cell-index: ${cellIndex}">${matrix[i][j]}</div>`;
                    cellIndex++;
                }
            }
            
            matrixHTML += '</div>';
            matrixDisplay.innerHTML = matrixHTML;
        } catch (error) {
            matrixDisplay.innerHTML = `
                <div class="matrix-title" style="color: var(--error-color);">
                    <i class="fas fa-exclamation-triangle"></i> ${error.message}
                </div>
            `;
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const icon = toast.querySelector('.toast-icon');
        const messageEl = toast.querySelector('.toast-message');
        
        toast.className = `toast ${type}`;
        messageEl.textContent = message;
        
        if (type === 'success') {
            icon.className = 'toast-icon fas fa-check-circle';
        } else {
            icon.className = 'toast-icon fas fa-exclamation-circle';
        }
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    displayResult(resultId, result, formattedId = null, prepared = null, preparedId = null) {
        document.getElementById(resultId).textContent = result;
        
        if (formattedId) {
            const formatted = this.formatResult(result);
            document.getElementById(formattedId).textContent = `Formatted (5-letter groups): ${formatted}`;
        }
        
        if (prepared && preparedId) {
            document.getElementById(preparedId).textContent = prepared;
        }
    }
}

// Global functions for HTML onclick handlers
function caesarOperation(operation) {
    const text = document.getElementById('caesar-text').value.trim();
    const shift = parseInt(document.getElementById('caesar-shift').value);
    
    if (!text) {
        ui.showToast('Please enter text to process', 'error');
        return;
    }
    
    try {
        let result;
        if (operation === 'encrypt') {
            result = ClassicalCiphers.caesarEncrypt(text, shift);
        } else {
            result = ClassicalCiphers.caesarDecrypt(text, shift);
        }
        
        ui.displayResult('caesar-result', result, 'caesar-formatted');
        ui.showToast(`Caesar ${operation} completed successfully!`);
        
    } catch (error) {
        ui.showToast(error.message, 'error');
    }
}

function vigenereOperation(operation) {
    const text = document.getElementById('vigenere-text').value.trim();
    const key = document.getElementById('vigenere-key').value.trim();
    
    if (!text) {
        ui.showToast('Please enter text to process', 'error');
        return;
    }
    
    if (!key) {
        ui.showToast('Please enter a key', 'error');
        return;
    }
    
    try {
        let result;
        if (operation === 'encrypt') {
            result = ClassicalCiphers.vigenereEncrypt(text, key);
        } else {
            result = ClassicalCiphers.vigenereDecrypt(text, key);
        }
        
        ui.displayResult('vigenere-result', result);
        ui.showToast(`Vigenère ${operation} completed successfully!`);
        
    } catch (error) {
        ui.showToast(error.message, 'error');
    }
}

function playfairOperation(operation) {
    const text = document.getElementById('playfair-text').value.trim();
    const key = document.getElementById('playfair-key').value.trim();
    
    if (!text) {
        ui.showToast('Please enter text to process', 'error');
        return;
    }
    
    if (!key) {
        ui.showToast('Please enter a key', 'error');
        return;
    }
    
    try {
        let result;
        let prepared = null;
        
        if (operation === 'encrypt') {
            prepared = ClassicalCiphers.preparePlayfairText(text);
            result = ClassicalCiphers.playfairEncrypt(text, key);
        } else {
            result = ClassicalCiphers.playfairDecrypt(text, key);
        }
        
        ui.displayResult('playfair-result', result, null, prepared, 'playfair-prepared');
        ui.showToast(`Playfair ${operation} completed successfully!`);
        
    } catch (error) {
        ui.showToast(error.message, 'error');
    }
}

function copyResult(resultId) {
    const resultText = document.getElementById(resultId).textContent;
    
    if (!resultText || resultText === 'Result will appear here...') {
        ui.showToast('No result to copy', 'error');
        return;
    }
    
    navigator.clipboard.writeText(resultText).then(() => {
        ui.showToast('Result copied to clipboard!');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = resultText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        ui.showToast('Result copied to clipboard!');
    });
}

function runAllTests() {
    const testResults = document.getElementById('test-results');
    
    testResults.innerHTML = '<div style="text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary-color);"></i><br><br>Running tests...</div>';
    
    setTimeout(() => {
        const tests = [];
        
        // Caesar Test
        try {
            const caesarResult = ClassicalCiphers.caesarEncrypt("HELLO WORLD", 3);
            const caesarExpected = "KHOORZRUOG";
            const caesarPass = caesarResult === caesarExpected;
            
            tests.push({
                title: 'Caesar Cipher Test',
                input: 'HELLO WORLD',
                key: 'Shift: 3',
                expected: caesarExpected,
                actual: caesarResult,
                pass: caesarPass
            });
        } catch (error) {
            tests.push({
                title: 'Caesar Cipher Test',
                input: 'HELLO WORLD',
                key: 'Shift: 3',
                expected: 'KHOORZRUOG',
                actual: `Error: ${error.message}`,
                pass: false
            });
        }
        
        // Vigenère Test
        try {
            const vigenereResult = ClassicalCiphers.vigenereEncrypt("ATTACK AT DAWN", "LEMON");
            const vigenereExpected = "LXFOPVEFRNHR";
            const vigenerePass = vigenereResult === vigenereExpected;
            
            tests.push({
                title: 'Vigenère Cipher Test',
                input: 'ATTACK AT DAWN',
                key: 'Key: LEMON',
                expected: vigenereExpected,
                actual: vigenereResult,
                pass: vigenerePass
            });
        } catch (error) {
            tests.push({
                title: 'Vigenère Cipher Test',
                input: 'ATTACK AT DAWN',
                key: 'Key: LEMON',
                expected: 'LXFOPVEFRNHR',
                actual: `Error: ${error.message}`,
                pass: false
            });
        }
        
        // Playfair Test
        try {
            const playfairResult = ClassicalCiphers.playfairEncrypt("HIDETHEGOLDINTHETREESTUMP", "PLAYFAIREXAMPLE");
            const playfairExpected = "BMODZBXDNABEKUDMUIXMMOUVIF";
            const playfairPass = playfairResult === playfairExpected;
            
            tests.push({
                title: 'Playfair Cipher Test',
                input: 'HIDETHEGOLDINTHETREESTUMP',
                key: 'Key: PLAYFAIREXAMPLE',
                expected: playfairExpected,
                actual: playfairResult,
                pass: playfairPass
            });
        } catch (error) {
            tests.push({
                title: 'Playfair Cipher Test',
                input: 'HIDETHEGOLDINTHETREESTUMP',
                key: 'Key: PLAYFAIREXAMPLE',
                expected: 'BMODZBXDNABEKUDMUIXMMOUVIF',
                actual: `Error: ${error.message}`,
                pass: false
            });
        }
        
        // Decryption tests
        try {
            const caesarDecryptResult = ClassicalCiphers.caesarDecrypt("KHOORZRUOG", 3);
            const caesarDecryptPass = caesarDecryptResult === "HELLOWORLD";
            
            tests.push({
                title: 'Caesar Decryption Test',
                input: 'KHOORZRUOG',
                key: 'Shift: 3',
                expected: 'HELLOWORLD',
                actual: caesarDecryptResult,
                pass: caesarDecryptPass
            });
        } catch (error) {
            tests.push({
                title: 'Caesar Decryption Test',
                input: 'KHOORZRUOG',
                key: 'Shift: 3',
                expected: 'HELLOWORLD',
                actual: `Error: ${error.message}`,
                pass: false
            });
        }
        
        try {
            const vigenereDecryptResult = ClassicalCiphers.vigenereDecrypt("LXFOPVEFRNHR", "LEMON");
            const vigenereDecryptPass = vigenereDecryptResult === "ATTACKATDAWN";
            
            tests.push({
                title: 'Vigenère Decryption Test',
                input: 'LXFOPVEFRNHR',
                key: 'Key: LEMON',
                expected: 'ATTACKATDAWN',
                actual: vigenereDecryptResult,
                pass: vigenereDecryptPass
            });
        } catch (error) {
            tests.push({
                title: 'Vigenère Decryption Test',
                input: 'LXFOPVEFRNHR',
                key: 'Key: LEMON',
                expected: 'ATTACKATDAWN',
                actual: `Error: ${error.message}`,
                pass: false
            });
        }
        
        try {
            const playfairDecryptResult = ClassicalCiphers.playfairDecrypt("BMODZBXDNABEKUDMUIXMMOUVIF", "PLAYFAIREXAMPLE");
            // Playfair decryption may contain padding X's, so we check if it contains the expected content
            const playfairDecryptPass = playfairDecryptResult.includes("HIDETHEGOLDINTHETREESTUMP") || 
                                      playfairDecryptResult.replace(/X/g, '').includes("HIDETHEGOLDINTHETREESTUMP");
            
            tests.push({
                title: 'Playfair Decryption Test',
                input: 'BMODZBXDNABEKUDMUIXMMOUVIF',
                key: 'Key: PLAYFAIREXAMPLE',
                expected: 'Contains: HIDETHEGOLDINTHETREESTUMP',
                actual: playfairDecryptResult,
                pass: playfairDecryptPass
            });
        } catch (error) {
            tests.push({
                title: 'Playfair Decryption Test',
                input: 'BMODZBXDNABEKUDMUIXMMOUVIF',
                key: 'Key: PLAYFAIREXAMPLE',
                expected: 'Contains: HIDETHEGOLDINTHETREESTUMP',
                actual: `Error: ${error.message}`,
                pass: false
            });
        }
        
        // Display results
        const passedTests = tests.filter(test => test.pass).length;
        const totalTests = tests.length;
        
        let resultsHTML = `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">
                    <i class="fas fa-chart-bar"></i> Test Results
                </h3>
                <p style="color: var(--text-secondary); font-size: 1.1rem;">
                    ${passedTests}/${totalTests} tests passed
                </p>
            </div>
        `;
        
        tests.forEach((test, index) => {
            resultsHTML += `
                <div class="test-case" style="--test-index: ${index}">
                    <div class="test-header">
                        <div class="test-title">${test.title}</div>
                        <div class="test-status ${test.pass ? 'pass' : 'fail'}">
                            ${test.pass ? '✓ PASS' : '✗ FAIL'}
                        </div>
                    </div>
                    <div class="test-details">
                        <strong>Input:</strong> ${test.input}<br>
                        <strong>${test.key}</strong><br>
                        <strong>Expected:</strong> ${test.expected}<br>
                        <strong>Actual:</strong> ${test.actual}
                    </div>
                </div>
            `;
        });
        
        testResults.innerHTML = resultsHTML;
        
        if (passedTests === totalTests) {
            ui.showToast(`All ${totalTests} tests passed! 🎉`);
        } else {
            ui.showToast(`${passedTests}/${totalTests} tests passed`, 'error');
        }
    }, 1000);
}

// Initialize the application
let ui;
document.addEventListener('DOMContentLoaded', () => {
    ui = new UIController();
    console.log('Classical Ciphers Web Interface Loaded Successfully!');
});
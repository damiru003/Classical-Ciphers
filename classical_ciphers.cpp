#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include <cctype>
#include <map>
#include <set>

class ClassicalCiphers {
private:
    // Helper function to clean text (uppercase, alphabetic only)
    std::string cleanText(const std::string& text, bool keepSpaces = false) {
        std::string cleaned;
        for (char c : text) {
            if (std::isalpha(c)) {
                cleaned += std::toupper(c);
            } else if (keepSpaces && c == ' ') {
                cleaned += c;
            }
        }
        return cleaned;
    }

    // Helper function to validate alphabetic key
    bool isValidAlphabeticKey(const std::string& key) {
        if (key.empty()) return false;
        for (char c : key) {
            if (!std::isalpha(c)) return false;
        }
        return true;
    }

public:
    // Caesar/Shift Cipher
    std::string caesarEncrypt(const std::string& plaintext, int shift) {
        std::string cleaned = cleanText(plaintext);
        std::string result;
        
        shift = ((shift % 26) + 26) % 26; // Handle negative shifts
        
        for (char c : cleaned) {
            if (std::isalpha(c)) {
                char base = 'A';
                result += char((c - base + shift) % 26 + base);
            }
        }
        return result;
    }
    
    std::string caesarDecrypt(const std::string& ciphertext, int shift) {
        return caesarEncrypt(ciphertext, -shift);
    }

    // Vigenère Cipher
    std::string vigenereEncrypt(const std::string& plaintext, const std::string& key) {
        if (!isValidAlphabeticKey(key)) {
            throw std::invalid_argument("Key must contain only alphabetic characters");
        }
        
        std::string cleanedText = cleanText(plaintext);
        std::string cleanedKey = cleanText(key);
        std::string result;
        
        if (cleanedKey.empty()) {
            throw std::invalid_argument("Key cannot be empty");
        }
        
        for (size_t i = 0; i < cleanedText.length(); i++) {
            char textChar = cleanedText[i];
            char keyChar = cleanedKey[i % cleanedKey.length()];
            
            int shift = keyChar - 'A';
            char encryptedChar = ((textChar - 'A' + shift) % 26) + 'A';
            result += encryptedChar;
        }
        return result;
    }
    
    std::string vigenereDecrypt(const std::string& ciphertext, const std::string& key) {
        if (!isValidAlphabeticKey(key)) {
            throw std::invalid_argument("Key must contain only alphabetic characters");
        }
        
        std::string cleanedText = cleanText(ciphertext);
        std::string cleanedKey = cleanText(key);
        std::string result;
        
        if (cleanedKey.empty()) {
            throw std::invalid_argument("Key cannot be empty");
        }
        
        for (size_t i = 0; i < cleanedText.length(); i++) {
            char textChar = cleanedText[i];
            char keyChar = cleanedKey[i % cleanedKey.length()];
            
            int shift = keyChar - 'A';
            char decryptedChar = ((textChar - 'A' - shift + 26) % 26) + 'A';
            result += decryptedChar;
        }
        return result;
    }

    // Playfair Cipher
    std::vector<std::vector<char>> createPlayfairMatrix(const std::string& key) {
        if (!isValidAlphabeticKey(key)) {
            throw std::invalid_argument("Key must contain only alphabetic characters");
        }
        
        std::string cleanedKey = cleanText(key);
        std::vector<std::vector<char>> matrix(5, std::vector<char>(5));
        std::set<char> used;
        std::string keyString;
        
        // Add key characters (merge J->I)
        for (char c : cleanedKey) {
            if (c == 'J') c = 'I';
            if (used.find(c) == used.end()) {
                keyString += c;
                used.insert(c);
            }
        }
        
        // Add remaining alphabet
        for (char c = 'A'; c <= 'Z'; c++) {
            if (c == 'J') continue; // Skip J
            if (used.find(c) == used.end()) {
                keyString += c;
                used.insert(c);
            }
        }
        
        // Fill matrix
        int index = 0;
        for (int i = 0; i < 5; i++) {
            for (int j = 0; j < 5; j++) {
                matrix[i][j] = keyString[index++];
            }
        }
        
        return matrix;
    }
    
    std::pair<int, int> findPosition(const std::vector<std::vector<char>>& matrix, char c) {
        if (c == 'J') c = 'I';
        for (int i = 0; i < 5; i++) {
            for (int j = 0; j < 5; j++) {
                if (matrix[i][j] == c) {
                    return {i, j};
                }
            }
        }
        return {-1, -1};
    }
    
    std::string preparePlayfairText(const std::string& text) {
        std::string cleaned = cleanText(text);
        std::string prepared;
        
        // Replace J with I
        for (char& c : cleaned) {
            if (c == 'J') c = 'I';
        }
        
        // Create digraphs
        for (size_t i = 0; i < cleaned.length(); i++) {
            prepared += cleaned[i];
            
            // If next character is the same, insert X
            if (i + 1 < cleaned.length() && cleaned[i] == cleaned[i + 1]) {
                prepared += 'X';
            }
        }
        
        // Pad with X if odd length
        if (prepared.length() % 2 == 1) {
            prepared += 'X';
        }
        
        return prepared;
    }
    
    std::string playfairEncrypt(const std::string& plaintext, const std::string& key) {
        auto matrix = createPlayfairMatrix(key);
        std::string prepared = preparePlayfairText(plaintext);
        std::string result;
        
        for (size_t i = 0; i < prepared.length(); i += 2) {
            char first = prepared[i];
            char second = prepared[i + 1];
            
            auto pos1 = findPosition(matrix, first);
            auto pos2 = findPosition(matrix, second);
            
            int row1 = pos1.first, col1 = pos1.second;
            int row2 = pos2.first, col2 = pos2.second;
            
            if (row1 == row2) {
                // Same row - move right
                result += matrix[row1][(col1 + 1) % 5];
                result += matrix[row2][(col2 + 1) % 5];
            } else if (col1 == col2) {
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
    
    std::string playfairDecrypt(const std::string& ciphertext, const std::string& key) {
        auto matrix = createPlayfairMatrix(key);
        std::string cleaned = cleanText(ciphertext);
        std::string result;
        
        for (size_t i = 0; i < cleaned.length(); i += 2) {
            char first = cleaned[i];
            char second = cleaned[i + 1];
            
            auto pos1 = findPosition(matrix, first);
            auto pos2 = findPosition(matrix, second);
            
            int row1 = pos1.first, col1 = pos1.second;
            int row2 = pos2.first, col2 = pos2.second;
            
            if (row1 == row2) {
                // Same row - move left
                result += matrix[row1][(col1 - 1 + 5) % 5];
                result += matrix[row2][(col2 - 1 + 5) % 5];
            } else if (col1 == col2) {
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
    
    void printPlayfairMatrix(const std::string& key) {
        auto matrix = createPlayfairMatrix(key);
        std::cout << "\nPlayfair Key Matrix:\n";
        std::cout << "  0 1 2 3 4\n";
        for (int i = 0; i < 5; i++) {
            std::cout << i << " ";
            for (int j = 0; j < 5; j++) {
                std::cout << matrix[i][j] << " ";
            }
            std::cout << "\n";
        }
        std::cout << "\n";
    }
};

class Menu {
private:
    ClassicalCiphers cipher;
    
    void printHeader() {
        std::cout << "\n" << std::string(60, '=') << "\n";
        std::cout << "           CLASSICAL CIPHERS - ALL-IN-ONE PROGRAM\n";
        std::cout << std::string(60, '=') << "\n\n";
    }
    
    void printMainMenu() {
        std::cout << "Select a Cipher:\n";
        std::cout << "1. Caesar/Shift Cipher\n";
        std::cout << "2. Vigenère Cipher\n";
        std::cout << "3. Playfair Cipher\n";
        std::cout << "4. Run Test Cases\n";
        std::cout << "5. Exit\n";
        std::cout << "Enter your choice (1-5): ";
    }
    
    void printOperationMenu() {
        std::cout << "\nSelect Operation:\n";
        std::cout << "1. Encrypt\n";
        std::cout << "2. Decrypt\n";
        std::cout << "Enter your choice (1-2): ";
    }
    
    int getChoice(int min, int max) {
        int choice;
        while (!(std::cin >> choice) || choice < min || choice > max) {
            std::cout << "Invalid input. Please enter a number between " << min << " and " << max << ": ";
            std::cin.clear();
            std::cin.ignore(1000, '\n');
        }
        std::cin.ignore(); // Clear the newline
        return choice;
    }
    
    std::string getInput(const std::string& prompt) {
        std::cout << prompt;
        std::string input;
        std::getline(std::cin, input);
        return input;
    }
    
    void handleCaesar() {
        printOperationMenu();
        int operation = getChoice(1, 2);
        
        std::string text = getInput(operation == 1 ? "Enter plaintext: " : "Enter ciphertext: ");
        if (text.empty()) {
            std::cout << "Error: Text cannot be empty!\n";
            return;
        }
        
        std::cout << "Enter shift value: ";
        int shift = getChoice(-25, 25);
        
        try {
            std::string result;
            if (operation == 1) {
                result = cipher.caesarEncrypt(text, shift);
                std::cout << "\nEncryption Result:\n";
            } else {
                result = cipher.caesarDecrypt(text, shift);
                std::cout << "\nDecryption Result:\n";
            }
            
            std::cout << "Input: " << text << "\n";
            std::cout << "Shift: " << shift << "\n";
            std::cout << "Output: " << result << "\n";
            
            // Format in 5-letter groups for better readability
            std::cout << "Formatted: ";
            for (size_t i = 0; i < result.length(); i++) {
                if (i > 0 && i % 5 == 0) std::cout << " ";
                std::cout << result[i];
            }
            std::cout << "\n";
            
        } catch (const std::exception& e) {
            std::cout << "Error: " << e.what() << "\n";
        }
    }
    
    void handleVigenere() {
        printOperationMenu();
        int operation = getChoice(1, 2);
        
        std::string text = getInput(operation == 1 ? "Enter plaintext: " : "Enter ciphertext: ");
        if (text.empty()) {
            std::cout << "Error: Text cannot be empty!\n";
            return;
        }
        
        std::string key = getInput("Enter key: ");
        if (key.empty()) {
            std::cout << "Error: Key cannot be empty!\n";
            return;
        }
        
        try {
            std::string result;
            if (operation == 1) {
                result = cipher.vigenereEncrypt(text, key);
                std::cout << "\nEncryption Result:\n";
            } else {
                result = cipher.vigenereDecrypt(text, key);
                std::cout << "\nDecryption Result:\n";
            }
            
            std::cout << "Input: " << text << "\n";
            std::cout << "Key: " << key << "\n";
            std::cout << "Output: " << result << "\n";
            
        } catch (const std::exception& e) {
            std::cout << "Error: " << e.what() << "\n";
        }
    }
    
    void handlePlayfair() {
        printOperationMenu();
        int operation = getChoice(1, 2);
        
        std::string text = getInput(operation == 1 ? "Enter plaintext: " : "Enter ciphertext: ");
        if (text.empty()) {
            std::cout << "Error: Text cannot be empty!\n";
            return;
        }
        
        std::string key = getInput("Enter key: ");
        if (key.empty()) {
            std::cout << "Error: Key cannot be empty!\n";
            return;
        }
        
        try {
            cipher.printPlayfairMatrix(key);
            
            std::string result;
            if (operation == 1) {
                std::string prepared = cipher.preparePlayfairText(text);
                result = cipher.playfairEncrypt(text, key);
                std::cout << "Encryption Result:\n";
                std::cout << "Original: " << text << "\n";
                std::cout << "Prepared: " << prepared << "\n";
            } else {
                result = cipher.playfairDecrypt(text, key);
                std::cout << "Decryption Result:\n";
                std::cout << "Input: " << text << "\n";
            }
            
            std::cout << "Key: " << key << "\n";
            std::cout << "Output: " << result << "\n";
            
        } catch (const std::exception& e) {
            std::cout << "Error: " << e.what() << "\n";
        }
    }
    
    void runTestCases() {
        std::cout << "\n" << std::string(50, '=') << "\n";
        std::cout << "RUNNING TEST CASES\n";
        std::cout << std::string(50, '=') << "\n";
        
        // Caesar Test
        std::cout << "\n1. CAESAR CIPHER TEST:\n";
        std::cout << "Plaintext: HELLO WORLD\n";
        std::cout << "Shift: 3\n";
        std::string caesarResult = cipher.caesarEncrypt("HELLO WORLD", 3);
        std::cout << "Expected: KHOORZRUOG\n";
        std::cout << "Got:      " << caesarResult << "\n";
        std::cout << "Result:   " << (caesarResult == "KHOORZRUOG" ? "PASS" : "FAIL") << "\n";
        
        // Vigenère Test
        std::cout << "\n2. VIGENÈRE CIPHER TEST:\n";
        std::cout << "Plaintext: ATTACK AT DAWN\n";
        std::cout << "Key: LEMON\n";
        std::string vigenereResult = cipher.vigenereEncrypt("ATTACK AT DAWN", "LEMON");
        std::cout << "Expected: LXFOPVEFRNHR\n";
        std::cout << "Got:      " << vigenereResult << "\n";
        std::cout << "Result:   " << (vigenereResult == "LXFOPVEFRNHR" ? "PASS" : "FAIL") << "\n";
        
        // Playfair Test
        std::cout << "\n3. PLAYFAIR CIPHER TEST:\n";
        std::cout << "Key: PLAYFAIREXAMPLE\n";
        std::cout << "Plaintext: HIDETHEGOLDINTHETREESTUMP\n";
        cipher.printPlayfairMatrix("PLAYFAIREXAMPLE");
        std::string prepared = cipher.preparePlayfairText("HIDETHEGOLDINTHETREESTUMP");
        std::cout << "Prepared text: " << prepared << "\n";
        std::string playfairResult = cipher.playfairEncrypt("HIDETHEGOLDINTHETREESTUMP", "PLAYFAIREXAMPLE");
        std::cout << "Expected: BMODZBXDNABEKUDMUIXMMOUVIF\n";
        std::cout << "Got:      " << playfairResult << "\n";
        std::cout << "Result:   " << (playfairResult == "BMODZBXDNABEKUDMUIXMMOUVIF" ? "PASS" : "FAIL") << "\n";
        
        // Test decryption
        std::cout << "\n4. DECRYPTION TESTS:\n";
        
        std::string caesarDecrypt = cipher.caesarDecrypt("KHOORZRUOG", 3);
        std::cout << "Caesar decrypt: " << caesarDecrypt << " (should be: HELLOWORLD)\n";
        
        std::string vigenereDecrypt = cipher.vigenereDecrypt("LXFOPVEFRNHR", "LEMON");
        std::cout << "Vigenère decrypt: " << vigenereDecrypt << " (should be: ATTACKATDAWN)\n";
        
        std::string playfairDecrypt = cipher.playfairDecrypt("BMODZBXDNABEKUDMUIXMMOUVIF", "PLAYFAIREXAMPLE");
        std::cout << "Playfair decrypt: " << playfairDecrypt << "\n";
        std::cout << "  (should contain the original message with possible X padding)\n";
        
        std::cout << "\n" << std::string(50, '=') << "\n";
    }
    
public:
    void run() {
        while (true) {
            printHeader();
            printMainMenu();
            int choice = getChoice(1, 5);
            
            switch (choice) {
                case 1:
                    handleCaesar();
                    break;
                case 2:
                    handleVigenere();
                    break;
                case 3:
                    handlePlayfair();
                    break;
                case 4:
                    runTestCases();
                    break;
                case 5:
                    std::cout << "\nThank you for using Classical Ciphers!\n";
                    return;
            }
            
            std::cout << "\nPress Enter to continue...";
            std::cin.get();
        }
    }
};

int main() {
    Menu menu;
    menu.run();
    return 0;
}
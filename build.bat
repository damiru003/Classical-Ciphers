@echo off
echo ========================================
echo   Classical Ciphers - Build Script
echo ========================================
echo.

:: Check if g++ is available
g++ --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: g++ compiler not found!
    echo Please install MinGW or ensure g++ is in your PATH.
    echo.
    echo You can download MinGW from: https://www.mingw-w64.org/
    pause
    exit /b 1
)

echo Compiling classical_ciphers.cpp...
g++ -std=c++11 -o classical_ciphers.exe classical_ciphers.cpp

if %errorlevel% equ 0 (
    echo.
    echo ✓ Compilation successful!
    echo ✓ Executable created: classical_ciphers.exe
    echo.
    echo Choose an option:
    echo 1. Run the C++ program
    echo 2. Open web interface
    echo 3. Exit
    echo.
    set /p choice="Enter your choice (1-3): "
    
    if "!choice!"=="1" (
        echo.
        echo Starting Classical Ciphers program...
        echo ========================================
        classical_ciphers.exe
    ) else if "!choice!"=="2" (
        echo.
        echo Opening web interface...
        start index.html
    ) else (
        echo.
        echo Goodbye!
    )
) else (
    echo.
    echo ✗ Compilation failed!
    echo Please check the source code for errors.
)

echo.
pause
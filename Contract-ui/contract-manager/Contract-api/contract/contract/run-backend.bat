@echo off
echo ==========================================
echo Building Contract Manager Backend...
echo ==========================================
call mvnw.cmd clean package -DskipTests

if %ERRORLEVEL% NEQ 0 (
    echo Build Failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ==========================================
echo Starting Backend Server...
echo ==========================================
java -jar target/contract-0.0.1-SNAPSHOT.jar

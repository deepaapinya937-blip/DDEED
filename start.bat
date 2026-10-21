@echo off
title DEKTHEP STORE Server
echo ===================================================
echo   Starting DEKTHEP STORE Server...
echo ===================================================
cd /d "%~dp0"
start /b "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"
node server.js
pause

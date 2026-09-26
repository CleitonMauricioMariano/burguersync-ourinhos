@echo off
chcp 65001 > nul
cls
echo =======================================================
echo   🍔 BURGUERSYNC OURINHOS - INICIALIZADOR AUTOMÁTICO
echo =======================================================
echo.
echo [1/3] Verificando ambiente Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Node.js não foi encontrado no PATH.
    echo Por favor, instale o Node.js em: https://nodejs.org/
    pause
    exit /b
)

echo [2/3] Iniciando Servidor Local BurguerSync na porta 3000...
start "" http://localhost:3000

echo [3/3] Abrindo aplicação no navegador...
echo.
echo Servidor rodando! Pressione CTRL+C para encerrar.
echo.
node backend/server.js
pause

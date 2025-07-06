@echo off
echo.
echo [信息] 使用 Vite 启动开发 Web 工程。
echo.

%~d0
cd %~dp0

cd ..
yarn dev

pause
@echo off
chcp 65001 >nul
echo.
echo ========================================
echo    AI助手 - 慧宝 启动脚本
echo ========================================
echo.
echo 正在启动AI助手服务器...
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未找到Python，请先安装Python 3.7+
    echo 下载地址：https://www.python.org/downloads/
    pause
    exit /b 1
)

REM 检查依赖包
echo 检查依赖包...
python -c "import asyncio, httpx, websockets" >nul 2>&1
if errorlevel 1 (
    echo 正在安装依赖包...
    pip install asyncio httpx websockets
    if errorlevel 1 (
        echo ❌ 依赖包安装失败
        pause
        exit /b 1
    )
)

echo ✅ 依赖检查完成
echo.
echo 🚀 启动AI助手服务器...
echo 📡 服务地址：ws://localhost:8001
echo 🤖 虚拟助手：慧宝
echo 🌱 专业领域：农业灌溉系统
echo.
echo 按 Ctrl+C 停止服务器
echo.

REM 启动AI服务器
python ai_server.py

pause 
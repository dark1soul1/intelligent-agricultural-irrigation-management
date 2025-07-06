@echo off
chcp 65001 >nul
echo ========================================
echo    农业灌溉系统 - 智能启动脚本
echo ========================================
echo.

echo 正在启动所有服务...
echo.

echo 启动 Admin 后台管理系统...
start "Admin - 后台管理系统" cmd /k "chcp 65001 >nul && cd admin && yarn dev"

echo 启动 Portal 前台用户界面...
start "Portal - 前台用户界面" cmd /k "chcp 65001 >nul && cd portal && npm run dev"

echo 启动 AI 助手服务...
start "AI - 助手服务" cmd /k "chcp 65001 >nul && cd portal && python ai_server.py"

echo.
echo 等待服务启动...
echo.

REM 等待服务启动并检测端口
:wait_loop
echo 检测服务状态...
timeout /t 5 /nobreak >nul

REM 检测所有服务端口
netstat -an | findstr :80 >nul
set portal_ready=%errorlevel%
netstat -an | findstr :8081 >nul
set admin_ready=%errorlevel%
netstat -an | findstr :8001 >nul
set ai_ready=%errorlevel%

REM 检查是否所有服务都启动
if %portal_ready% neq 0 (
    echo Portal服务还未启动，继续等待...
    goto wait_loop
)
if %admin_ready% neq 0 (
    echo Admin服务还未启动，继续等待...
    goto wait_loop
)
if %ai_ready% neq 0 (
    echo AI服务还未启动，继续等待...
    goto wait_loop
)

echo.
echo ✅ 所有服务已启动成功！
echo.

echo.
echo 🌐 浏览器已自动打开！
echo 📱 Portal前台: http://localhost:80
echo 🖥️  Admin后台: http://localhost:8081
echo 🤖 AI服务: ws://localhost:8001
echo.
echo 按任意键关闭此窗口...
pause >nul 
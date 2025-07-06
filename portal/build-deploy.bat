@echo off
chcp 65001 >nul
echo ========================================
echo 智慧农业灌溉管理系统 - 用户端构建脚本
echo ========================================

echo.
echo 检查Node.js版本...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js未安装或未配置到PATH环境变量
    pause
    exit /b 1
)

echo.
echo 安装项目依赖...
call npm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo.
echo 清理之前的构建文件...
if exist dist rmdir /s /q dist

echo.
echo 构建生产版本...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ 构建失败
    pause
    exit /b 1
)

echo.
if exist dist (
    echo ✅ 构建成功！构建产物位于 dist/ 目录
    echo.
    echo 构建文件大小:
    dir dist /s
) else (
    echo ❌ 构建失败！dist目录不存在
    pause
    exit /b 1
)

echo.
echo ========================================
echo 构建完成
echo ========================================
echo.
echo 部署说明:
echo 1. 将 dist/ 目录上传到服务器
echo 2. 配置Nginx服务器
echo 3. 修改环境变量中的后端地址
echo 4. 重启Nginx服务
echo.
echo 参考 DEPLOY.md 文件获取详细部署说明
echo.
pause 
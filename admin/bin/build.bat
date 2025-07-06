@echo off
echo.
echo [信息] 开始构建Web工程，输出到dist文件夹
echo.

%~d0
cd %~dp0

cd ..
yarn build:prod

pause
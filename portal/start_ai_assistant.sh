#!/bin/bash

# 设置UTF-8编码
export LANG=zh_CN.UTF-8
export LC_ALL=zh_CN.UTF-8

echo ""
echo "========================================"
echo "    AI助手 - 慧宝 启动脚本"
echo "========================================"
echo ""
echo "正在启动AI助手服务器..."
echo ""

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误：未找到Python3，请先安装Python 3.7+"
    echo "Ubuntu/Debian: sudo apt install python3 python3-pip"
    echo "CentOS/RHEL: sudo yum install python3 python3-pip"
    echo "macOS: brew install python3"
    exit 1
fi

# 检查依赖包
echo "检查依赖包..."
python3 -c "import asyncio, httpx, websockets" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "正在安装依赖包..."
    pip3 install asyncio httpx websockets
    if [ $? -ne 0 ]; then
        echo "❌ 依赖包安装失败"
        exit 1
    fi
fi

echo "✅ 依赖检查完成"
echo ""
echo "🚀 启动AI助手服务器..."
echo "📡 服务地址：ws://localhost:8001"
echo "🤖 虚拟助手：慧宝"
echo "🌱 专业领域：农业灌溉系统"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

# 启动AI服务器
python3 ai_server.py 
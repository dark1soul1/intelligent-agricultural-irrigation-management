#!/bin/bash

# 智慧农业灌溉管理系统 - 用户端构建部署脚本

echo "=== 开始构建用户端项目 ==="

# 检查Node.js版本
echo "检查Node.js版本..."
node_version=$(node -v)
echo "当前Node.js版本: $node_version"

# 安装依赖
echo "安装项目依赖..."
npm install

# 清理之前的构建
echo "清理之前的构建文件..."
rm -rf dist

# 构建生产版本
echo "构建生产版本..."
npm run build

# 检查构建结果
if [ -d "dist" ]; then
    echo "✅ 构建成功！构建产物位于 dist/ 目录"
    echo "构建文件大小:"
    du -sh dist/
    echo ""
    echo "构建文件列表:"
    ls -la dist/
else
    echo "❌ 构建失败！"
    exit 1
fi

echo "=== 构建完成 ==="
echo ""
echo "部署说明:"
echo "1. 将 dist/ 目录上传到服务器"
echo "2. 配置Nginx服务器"
echo "3. 修改环境变量中的后端地址"
echo "4. 重启Nginx服务"
echo ""
echo "参考 DEPLOY.md 文件获取详细部署说明" 
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI助手依赖安装脚本
自动安装所需的Python包
"""

import subprocess
import sys
import os

def check_python_version():
    """检查Python版本"""
    if sys.version_info < (3, 7):
        print("❌ 错误：需要Python 3.7或更高版本")
        print(f"当前版本：{sys.version}")
        return False
    print(f"✅ Python版本检查通过：{sys.version}")
    return True

def install_package(package):
    """安装单个包"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        return True
    except subprocess.CalledProcessError:
        return False

def main():
    """主函数"""
    print("=" * 50)
    print("    AI助手 - 慧宝 依赖安装脚本")
    print("=" * 50)
    print()
    
    # 检查Python版本
    if not check_python_version():
        sys.exit(1)
    
    # 需要安装的包
    packages = [
        "httpx>=0.24.0",
        "websockets>=11.0.0"
    ]
    
    print("正在安装依赖包...")
    print()
    
    success_count = 0
    for package in packages:
        print(f"安装 {package}...")
        if install_package(package):
            print(f"✅ {package} 安装成功")
            success_count += 1
        else:
            print(f"❌ {package} 安装失败")
    
    print()
    print("=" * 50)
    if success_count == len(packages):
        print("🎉 所有依赖包安装成功！")
        print()
        print("下一步：")
        print("1. 运行 'python ai_server.py' 启动AI服务器")
        print("2. 在另一个终端运行 'npm run dev' 启动前端")
        print("3. 在浏览器中访问应用，点击右下角的慧宝开始聊天")
    else:
        print(f"⚠️  部分依赖包安装失败 ({success_count}/{len(packages)})")
        print("请手动安装失败的包：")
        for package in packages:
            print(f"   pip install {package}")
    
    print("=" * 50)

if __name__ == "__main__":
    main() 
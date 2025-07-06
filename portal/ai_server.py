#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI助手服务器启动脚本
基于DeepSeek API的WebSocket聊天服务
"""

import asyncio
import json
import httpx
import websockets
from threading import Lock
import logging
import sys
import os

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('ai_server.log', encoding='utf-8')
    ]
)

# API配置
API_KEY = "sk-74d15b847add4424876c84add92474e0"
API_URL = "https://api.deepseek.com/v1/chat/completions"

# 会话管理（线程安全）
sessions = {}  # session_id: [{"role":..., "content":...}, ...]
session_lock = Lock()

def get_history(session_id):
    """获取会话历史"""
    with session_lock:
        return sessions.get(session_id, [])

def update_history(session_id, role, content):
    """更新会话历史"""
    with session_lock:
        if session_id not in sessions:
            sessions[session_id] = []
        sessions[session_id].append({"role": role, "content": content})

async def call_deepseek_api_stream(session_id, websocket):
    """调用DeepSeek API进行流式响应"""
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    history = get_history(session_id)
    
    # 添加系统提示，让AI更了解农业灌溉系统
    system_prompt = {
        "role": "system",
        "content": """你是一个专业的农业灌溉系统AI助手，名叫"慧宝"。你的主要职责是：

1. 帮助用户解答关于农业灌溉系统的问题
2. 提供灌溉技术建议和最佳实践
3. 解释灌溉设备的工作原理和使用方法
4. 协助用户制定灌溉计划
5. 回答关于土壤湿度、温度等环境因素的问题
6. 提供节水灌溉的建议

请用友好、专业的语气回答用户问题，并尽可能提供实用、具体的建议。如果用户的问题超出你的专业范围，请诚实地说明并建议用户咨询相关专家。"""
    }
    
    # 将系统提示添加到历史记录开头
    messages = [system_prompt] + history
    
    payload = {
        "model": "deepseek-chat",
        "messages": messages,
        "temperature": 0.7,
        "stream": True
    }

    try:
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream("POST", API_URL, headers=headers, json=payload) as response:
                if response.status_code != 200:
                    error_msg = f"API请求失败: {response.status_code}"
                    logging.error(error_msg)
                    await websocket.send(json.dumps({"error": error_msg}))
                    return ""
                
                partial_response = ""
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        if line.strip() == "data: [DONE]":
                            break
                        try:
                            data = json.loads(line[6:])
                            delta = data["choices"][0]["delta"]
                            content = delta.get("content")
                            if content:
                                partial_response += content
                                await websocket.send(json.dumps({"delta": content}))
                        except Exception as e:
                            logging.error(f"解析异常: {str(e)}")
                            await websocket.send(json.dumps({"error": f"解析异常: {str(e)}"}))
                return partial_response
    except Exception as e:
        error_msg = f"API调用失败: {str(e)}"
        logging.error(error_msg)
        await websocket.send(json.dumps({"error": error_msg}))
        return ""

async def handle_connection(websocket, path):
    """处理WebSocket连接"""
    client_address = websocket.remote_address
    logging.info(f"客户端连接: {client_address}")
    
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                session_id = data.get("session_id")
                user_message = data.get("message")

                if not session_id or not user_message:
                    await websocket.send(json.dumps({"error": "session_id and message are required"}))
                    continue

                logging.info(f"收到消息 [Session: {session_id}]: {user_message[:50]}...")

                # 先保存用户消息
                update_history(session_id, "user", user_message)

                # 调用DeepSeek接口流式响应
                assistant_response = await call_deepseek_api_stream(session_id, websocket)

                # 发送结束标志
                await websocket.send(json.dumps({"done": True}))

                # 保存助手回复
                if assistant_response:
                    update_history(session_id, "assistant", assistant_response)
                    logging.info(f"回复完成 [Session: {session_id}]: {assistant_response[:50]}...")

            except json.JSONDecodeError as e:
                logging.error(f"JSON解析错误: {str(e)}")
                await websocket.send(json.dumps({"error": f"JSON解析错误: {str(e)}"}))
            except Exception as e:
                logging.error(f"处理消息异常: {str(e)}")
                await websocket.send(json.dumps({"error": f"处理消息异常: {str(e)}"}))
                
    except websockets.exceptions.ConnectionClosed:
        logging.info(f"客户端断开连接: {client_address}")
    except Exception as e:
        logging.error(f"连接处理异常: {str(e)}")

async def main():
    """主函数"""
    host = "0.0.0.0"
    port = 8001
    
    logging.info(f"AI助手服务器启动中...")
    logging.info(f"WebSocket服务地址: ws://{host}:{port}")
    logging.info(f"API配置: {API_URL}")
    
    try:
        async with websockets.serve(handle_connection, host=host, port=port):
            logging.info(f"✅ AI助手服务器启动成功！")
            logging.info(f"📡 监听地址: ws://{host}:{port}")
            logging.info(f"🤖 虚拟助手: 慧宝")
            logging.info(f"🌱 专业领域: 农业灌溉系统")
            logging.info("按 Ctrl+C 停止服务器")
            
            await asyncio.Future()  # 永不结束，保持运行
            
    except Exception as e:
        logging.error(f"服务器启动失败: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logging.info("服务器已停止")
    except Exception as e:
        logging.error(f"服务器异常退出: {str(e)}")
        sys.exit(1) 
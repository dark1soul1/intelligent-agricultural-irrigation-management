# 智慧农业灌溉管理系统 - 管理端部署说明

## 项目简介
智慧农业灌溉管理系统管理端，基于Vue3 + Element Plus + Vite构建。

## 技术栈
- Vue 3.5.16
- Element Plus 2.9.9
- Vite 6.3.5
- Pinia 3.0.2
- Vue Router 4.5.1
- Axios 1.9.0
- ECharts 5.6.0

## 部署环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0

## 本地开发
```bash
# 安装依赖
npm install
# 或
yarn install

# 启动开发服务器
npm run dev
# 或
yarn dev
```

## 生产环境构建
```bash
# 构建生产版本
npm run build:prod
# 或
yarn build:prod

# 构建产物位于 dist/ 目录
```

## 环境配置

### 开发环境 (env.development)
```
VITE_APP_ENV = 'development'
VITE_APP_BASE_API = '/dev-api'
VITE_APP_TITLE = '智慧农业灌溉管理系统'
VITE_BACKEND_URL = 'http://192.168.43.80:8080'
VITE_PORT = 80
```

### 生产环境 (env.production)
```
VITE_APP_ENV = 'production'
VITE_APP_BASE_API = '/prod-api'
VITE_APP_TITLE = '智慧农业灌溉管理系统'
VITE_BACKEND_URL = 'http://192.168.43.80:8080'
```

## Nginx配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/admin/dist;
    index index.html;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API代理
    location /prod-api/ {
        proxy_pass http://your-backend-server:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 前端路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 部署步骤
1. 在本地执行 `npm run build:prod` 构建生产版本
2. 将 `dist/` 目录上传到服务器
3. 配置Nginx服务器
4. 修改环境变量中的后端地址为实际的后端服务器地址
5. 重启Nginx服务

## 注意事项
- 确保后端API地址配置正确
- 生产环境需要配置HTTPS
- 建议启用Gzip压缩
- 配置适当的缓存策略
- 注意跨域配置 
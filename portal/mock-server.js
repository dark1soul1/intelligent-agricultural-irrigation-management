const express = require('express');
const cors = require('cors');
const app = express();
const port = 4523;

// 启用CORS
app.use(cors());

// 解析JSON
app.use(express.json());

// 邮箱验证码接口
app.get('/m1/6686103-6395409-default/email/:email', (req, res) => {
  const { email } = req.params;
  
  // 模拟验证码生成
  const verificationCode = Math.floor(100000 + Math.random() * 900000);
  const uuid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  console.log(`发送验证码到邮箱: ${email}, 验证码: ${verificationCode}`);
  
  // 模拟延迟
  setTimeout(() => {
    res.json({
      code: 200,
      msg: "操作成功",
      uuid: uuid,
      data: {
        email: email,
        verificationCode: verificationCode
      }
    });
  }, 1000);
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mock server is running' });
});

app.listen(port, () => {
  console.log(`Mock server is running on http://localhost:${port}`);
  console.log(`Email verification endpoint: http://localhost:${port}/m1/6686103-6395409-default/email/:email`);
}); 
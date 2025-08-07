# Paddle 订阅演示

这是一个展示登录、注册和订阅功能的演示应用程序，使用EdgeOne Pages和Supabase身份验证。

## 特点

- 通过Supabase进行用户身份验证（登录/注册）
- 电子邮件验证流程
- 不同定价层的订阅计划
- 订阅管理
- 为订阅用户提供的受保护的仪表盘

## 技术栈

- **前端**: Next.js（静态站点生成）
- **组件**: 使用shadcn/ui的自定义组件
- **样式**: Tailwind CSS
- **后端**: EdgeOne Functions用于API
- **身份验证**: Supabase身份验证
- **数据库**: Supabase（PostgreSQL）

## 入门

### 先决条件

- Node.js 18+ 和 npm
- Supabase账户和项目

### Supabase 设置

1. 在[https://supabase.com](https://supabase.com)创建一个新的Supabase项目
2. 在你的Supabase仪表盘中，转到身份验证 > 设置，并：
   - 配置电子邮件身份验证提供商
   - 如果需要，启用“确认电子邮件”功能
3. 从项目设置 > API获取你的Supabase URL和API密钥

### Paddle 设置
#### Paddle 设置

1. 在 [https://paddle.com](https://paddle.com) 创建一个新的 Paddle 账户
2. 在你的 Paddle 控制面板中，找到你的产品并创建一个新的产品
3. 获取你的 Paddle API 密钥

#### Paddle 产品设置

1. 在你的 Paddle 控制面板中，找到你的产品并点击 "编辑"
2. 在 "价格" 选项卡中，设置你的产品的价格和订阅计划
3. 在 "Webhook" 选项卡中，设置你的 Webhook URL 为 `https://yourdomain.com/api/paddle/webhook`

### 安装

1. 克隆存储库：

```bash
git clone https://github.com/yourusername/paddle-subscription-demo.git
cd paddle-subscription-demo
```

2. 安装依赖项：

```bash
npm install
```

### 开发

#### 环境变量
```
# 本地调试时添加以下环境变量以处理跨域问题
NEXT_PUBLIC_DEV=true
NEXT_PUBLIC_API_URL_DEV=http://localhost:8088/
FRONT_END_URL_DEV=http://localhost:3000/

# Supabase 配置
SUPABASE_URL=https://xxxxxx.supabase.co
SUPABASE_ANON_KEY=xxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxx

# Paddle 配置
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox
PADDLE_API_KEY=pdl_sdbx_apikey_xxxxxx
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=test_xxxxxxx
PADDLE_WEBHOOK_SECRET=pdl_ntfset_xxxxxxxxx
```

获取方式：
| 变量 | 用途 | 获取方式 |
| --- | --- | --- |
| SUPABASE_URL | Supabase 请求地址 | Supabase Dashboard > Project Settings > Data API选项卡内获取 |
| SUPABASE_ANON_KEY | 发起 Supabase 请求时使用的公钥 | Supabase Dashboard > Project Settings > Data API选项卡内获取 |
| SUPABASE_SERVICE_ROLE_KEY | 发起非公开 Supabase 请求时使用的密钥 | Supabase Dashboard > Project Settings > Data API选项卡内获取 |
| NEXT_PUBLIC_PADDLE_ENVIRONMENT | Paddle 项目环境 | 'production' 或 'sandbox' |
| PADDLE_API_KEY | 函数与 Paddle 交互的 的 API Key | [Paddle > Developer tools > Authentication](https://sandbox-vendors.paddle.com/authentication-v2) 下创建 |
| NEXT_PUBLIC_PADDLE_CLIENT_TOKEN | 客户端使用的 Key，用于前端与 Paddle 交互。 | [Paddle > Developer tools > Authentication](https://sandbox-vendors.paddle.com/authentication-v2) 下创建 |
| PADDLE_WEBHOOK_SECRET | 给 Webhook 鉴别请求来源，保证安全性的密钥。 | [Paddle > Developer tools > Notifications](https://sandbox-vendors.paddle.com/notifications) 下创建。 |

#### 本地开发

1. 启动Next.js开发服务器：

```bash
npm run dev
```

2. 在另一个终端中，启动EdgeOne Functions开发服务器：

```bash
npm run functions:dev
```

3. 在浏览器中打开[http://localhost:3000](http://localhost:3000)，查看应用程序。

## 项目结构

- `/src` - Next.js前端代码
  - `/app` - Next.js应用目录
  - `/components` - React组件
  - `/lib` - 实用函数
- `/functions` - EdgeOne Functions用于后端API
  - `/auth` - 与Supabase集成的身份验证API
  - `/subscription` - 订阅API（订阅、状态、取消）
  - `/lib` - EdgeOne Functions共享的实用工具

## 数据库设计

在生产环境中，你将扩展Supabase数据库，包括：

- `subscriptions` 表 - 存储订阅信息
- `plans` 表 - 存储计划详细信息

## 部署
[![使用 EdgeOne Pages 部署](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://console.cloud.tencent.com/edgeone/pages/new?from=github&template=paddle-subscription-starter)


## 许可证

本项目根据MIT许可证进行授权 - 详情请见[LICENSE](LICENSE)文件。

# DeFi 投资顾问系统

这是一个基于多代理架构的 DeFi 投资组合生成系统，使用 LangGraph 框架实现。系统由三个专业代理组成：

1. DeFi 投研 Agent - 分析借贷平台数据和利率
2. 市场分析 Agent - 分析市场趋势和技术指标
3. Portfolio Manager - 整合分析结果，生成最终投资组合

## 功能特点

- 分析 Aires 和 Joule Finance 借贷平台数据
- 分析 Hyperion 流动性池数据
- 基于用户风险偏好生成投资建议
- 使用仓位比例而不是固定金额进行资产分配
- 为不同时间段(14 天、30 天、90 天、180 天)生成投资策略
- 根据时间长度调整风险评估和价格区间
- 提供 REST API 接口

## 安装

1. 克隆仓库：

```bash
cd 11-Flex/api
```

2. 安装依赖：

```bash
pip install -r requirements.txt  # Install the package
pip install -U crawl4ai

# For pre release versions
pip install crawl4ai --pre

# Run post-installation setup
crawl4ai-setup

# Verify your installation
crawl4ai-doctor
```

1. 创建`.env`文件并添加 OpenAI API 密钥：

```
OPENAI_API_KEY=your_api_key_here
```

## 使用方法

### 直接运行

```bash
python multi_agent_system.py
```

这将使用示例参数运行系统（中等风险偏好）。

### 启动 API 服务

```bash
python api.py
```

服务将在 http://localhost:8000 启动，提供以下接口：

- `GET /` - 服务信息
- `POST /generate-portfolio` - 生成投资组合建议
  - 参数：
    - `apy` (float): 预期年利率
    - `risk_preference` (string): 风险偏好("low", "medium", "high")
    - `custom_prompt` (string, 可选): 用户自定义提示

### API 请求示例

```bash
curl -X POST "http://localhost:8000/generate-portfolio" \
     -H "Content-Type: application/json" \
     -d '{
       "risk_preference": "medium",
       "custom_prompt": "我想关注APT生态系统的机会"
     }'
```

### 示例响应

```json
{
  "14days": {
    "expected_return": 5.2,
    "risk_index": 30,
    "platforms": {
      "Joule": {
        "positions": [
          {
            "asset": "USDC",
            "action": "lend",
            "allocation": "40%",
            "rationale": "安全稳定收益，利率相对较高"
          }
        ]
      },
      "Aries": {
        "positions": [
          {
            "asset": "USDC",
            "action": "lend",
            "allocation": "30%",
            "rationale": "更高存款利率，适合中等风险承受能力"
          }
        ]
      },
      "Hyperion": {
        "positions": [
          {
            "asset": "APT-USDC",
            "action": "add_liquidity",
            "allocation": "30%",
            "fee_tier": 0.05,
            "price_range": {
              "lower": 4.9,
              "upper": 5.3
            },
            "rationale": "短期流动性挖矿，较窄价格区间"
          }
        ]
      }
    }
  },
  "30days": {
    "expected_return": 8.5,
    "risk_index": 45,
    "platforms": {
      "Joule": {
        "positions": [
          {
            "asset": "USDC",
            "action": "lend",
            "allocation": "35%",
            "rationale": "中期稳定收益"
          }
        ]
      },
      "Aries": {
        "positions": [
          {
            "asset": "USDC",
            "action": "lend",
            "allocation": "25%",
            "rationale": "中期稳定收益，略高收益率"
          }
        ]
      },
      "Hyperion": {
        "positions": [
          {
            "asset": "APT-USDC",
            "action": "add_liquidity",
            "allocation": "40%",
            "fee_tier": 0.3,
            "price_range": {
              "lower": 4.8,
              "upper": 5.5
            },
            "rationale": "中期流动性挖矿，稍宽价格区间"
          }
        ]
      }
    }
  },
  "90days": {
    "expected_return": 15.8,
    "risk_index": 60,
    "platforms": {
      "Joule": {
        "positions": [
          {
            "asset": "USDC",
            "action": "lend",
            "allocation": "20%",
            "rationale": "长期稳定收益"
          }
        ]
      },
      "Aries": {
        "positions": [
          {
            "asset": "APT",
            "action": "lend",
            "allocation": "20%",
            "rationale": "长期APT生态收益"
          }
        ]
      },
      "Hyperion": {
        "positions": [
          {
            "asset": "APT-USDC",
            "action": "add_liquidity",
            "allocation": "60%",
            "fee_tier": 0.3,
            "price_range": {
              "lower": 4.6,
              "upper": 6.0
            },
            "rationale": "长期流动性挖矿，较宽价格区间"
          }
        ]
      }
    }
  },
  "180days": {
    "expected_return": 24.5,
    "risk_index": 75,
    "platforms": {
      "Joule": {
        "positions": [
          {
            "asset": "stAPT",
            "action": "lend",
            "allocation": "10%",
            "rationale": "超长期稳定收益"
          }
        ]
      },
      "Aries": {
        "positions": [
          {
            "asset": "APT",
            "action": "lend",
            "allocation": "20%",
            "rationale": "超长期APT生态收益"
          }
        ]
      },
      "Hyperion": {
        "positions": [
          {
            "asset": "APT-USDC",
            "action": "add_liquidity",
            "allocation": "40%",
            "fee_tier": 0.3,
            "price_range": {
              "lower": 4.4,
              "upper": 6.5
            },
            "rationale": "超长期流动性挖矿，宽价格区间"
          },
          {
            "asset": "APT-USDt",
            "action": "add_liquidity",
            "allocation": "30%",
            "fee_tier": 0.05,
            "price_range": {
              "lower": 4.5,
              "upper": 6.2
            },
            "rationale": "超长期流动性挖矿，高收益，有奖励"
          }
        ]
      }
    }
  }
}
```

## 系统架构

系统使用 LangGraph 实现多代理工作流：

1. 依次执行 DeFi 投研 Agent 和市场分析 Agent
2. 两个 Agent 的分析结果传递给 Portfolio Manager
3. Portfolio Manager 生成针对不同时间段的投资组合建议

所有代理都使用大型语言模型实现，基于最新市场数据提供分析和建议。

## 时间段策略说明

系统根据不同的投资时间段调整策略：

- **14 天策略**：价格区间较窄，采用保守预测，风险较低
- **30 天策略**：价格区间稍宽，适合中短期投资
- **90 天策略**：价格区间较宽，考虑中期波动，风险中等
- **180 天策略**：价格区间最宽，为长期波动预留空间，风险较高

对于 Hyperion 流动性池投资，系统会根据时间段调整价格区间：

- 时间越长，价格区间越宽
- 对看涨预期，价格区间会偏高（但包含当前价格）
- 长期策略会有更多元化的资产配置

## 注意事项

- 这是一个投资辅助工具，不构成投资建议
- 实际投资前请自行进行充分研究
- 系统依赖外部 API 获取最新市场数据

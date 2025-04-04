import asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import uvicorn
from typing import Optional, Dict, Any

from multi_agent_system import run_investment_advisor

app = FastAPI(
    title="DeFi投资顾问API",
    description="一个基于多代理架构的DeFi投资组合生成系统，提供多时间段(14/30/90/180天)投资策略",
    version="0.1.0",
)


class InvestmentRequest(BaseModel):
    risk_preference: str = Field(
        ..., description="风险偏好", examples=["low", "medium", "high"]
    )
    custom_prompt: Optional[str] = Field(
        "", description="用户自定义提示，如特定代币偏好或投资策略"
    )


@app.post("/generate-portfolio", response_model=Dict[str, Any])
async def generate_portfolio(request: InvestmentRequest):
    """
    生成DeFi多时间段投资组合建议

    - **risk_preference**: 风险偏好 (low/medium/high)
    - **custom_prompt**: 自定义提示

    返回包含14天、30天、90天和180天投资策略的JSON

    每个时间段包含：
    - expected_return: 预期收益率
    - risk_index: 风险指数
    - platforms: 三个平台(Joule, Aries, Hyperion)的仓位分配
    """
    try:
        # 验证风险偏好输入
        if request.risk_preference not in ["low", "medium", "high"]:
            raise HTTPException(
                status_code=400, detail="风险偏好必须是'low'、'medium'或'high'之一"
            )

        # 调用多代理系统生成投资组合建议
        result = await run_investment_advisor(
            risk_preference=request.risk_preference, custom_prompt=request.custom_prompt
        )

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"处理请求时出错: {str(e)}")


@app.get("/")
async def root():
    return {
        "message": "DeFi投资顾问API - 提供多时间段投资策略",
        "usage": "POST /generate-portfolio 生成14/30/90/180天投资组合建议",
    }


if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)

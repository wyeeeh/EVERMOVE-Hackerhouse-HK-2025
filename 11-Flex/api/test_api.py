import asyncio
import json
import requests
import time
from typing import Dict, Any


async def test_api_call(
    risk_preference: str, custom_prompt: str = ""
) -> Dict[str, Any]:
    """
    测试API调用，发送请求并获取投资组合建议

    参数:
        risk_preference: 风险偏好，可选值: "low"(低), "medium"(中), "high"(高)
        custom_prompt: 用户自定义提示

    返回:
        投资组合建议（JSON格式）
    """
    print(f"\n测试风险偏好 '{risk_preference}' 的API调用...")
    url = "http://localhost:8000/generate-portfolio"

    # 准备请求数据
    payload = {"risk_preference": risk_preference, "custom_prompt": custom_prompt}

    # 发送POST请求
    try:
        print(f"发送请求到 {url}...")
        response = requests.post(
            url, json=payload, timeout=180
        )  # 较长超时时间，因为LLM处理可能需要时间

        # 检查响应状态
        if response.status_code == 200:
            print("请求成功，获取响应数据...")
            result = response.json()
            return result
        else:
            print(f"请求失败，状态码: {response.status_code}")
            print(f"错误信息: {response.text}")
            return {}

    except requests.exceptions.RequestException as e:
        print(f"请求异常: {str(e)}")
        return {}




async def main():
    """
    主函数：测试不同风险偏好下的API调用
    """
    print("开始API测试...\n")
    print("确保API服务已在 http://localhost:8000 启动")

    # 检查API是否在运行
    try:
        response = requests.get("http://localhost:8000/")
        if response.status_code != 200:
            print("API服务可能未启动，请先运行 'python api.py'")
            return
    except:
        print("无法连接到API服务，请确保服务已启动")
        return

    # 测试不同风险偏好
    risk_preferences = [ "medium"]
    custom_prompt = "我想关注APT生态系统的发展，并根据不同的投资时间段进行资产配置"

    results = {}
    for risk in risk_preferences:
        print(f"\n===== 测试 {risk.upper()} 风险偏好 =====")
        start_time = time.time()
        result = await test_api_call(risk, custom_prompt)

    print("\n测试完成！")


if __name__ == "__main__":
    # 运行测试
    asyncio.run(main())

import os
import asyncio
from typing import Annotated, Dict, List, TypedDict, Optional
import json
import random

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph
from langgraph.graph.message import add_messages

# 导入市场数据获取功能
from get_marketdata import get_marketdata

# 加载环境变量
load_dotenv()

# 确认API密钥已加载
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("未找到OPENAI_API_KEY环境变量，请确保.env文件正确配置")

# 创建LLM实例
llm = ChatOpenAI(model="gpt-4o-mini", base_url="https://xiaoai.plus/v1")

llm_plus = ChatOpenAI(model="deepseek-r1", base_url="https://xiaoai.plus/v1")


# 定义系统状态
class State(TypedDict):
    messages: Annotated[list, add_messages]
    market_data: Dict  # 市场数据
    defi_analysis: Dict  # DeFi投研分析结果
    market_analysis: Dict  # 市场分析结果
    portfolio_recommendation: Dict  # 投资组合建议
    user_input: Dict  # 用户输入(风险偏好、自定义提示)


# 创建图构建器
graph_builder = StateGraph(State)


# DeFi投研Agent：分析借贷利率信息
async def defi_research_agent(state: State):
    print("执行DeFi投研Agent...")

    # 获取市场数据
    market_data = state["market_data"]
    user_input = state["user_input"]

    # 构建提示信息
    prompt = f"""
    你是一位DeFi借贷市场专家。请基于以下借贷平台数据分析最优借贷策略。
    
    风险偏好: {user_input['risk_preference']}
    用户自定义提示: {user_input['custom_prompt']}
    
    市场数据:
    {json.dumps(market_data, indent=2, ensure_ascii=False)}
    
    请分析并提供以下内容:
    1. 各平台(Aries, Joule)的借贷利率比较
    2. 各代币的风险评估
    3. 基于用户风险偏好推荐的借贷策略（按比例分配，不需要具体金额）
    4. LTV和清算风险分析
    Aries, Joule目前有3%的lend bonus，记得处理
    目前APT-USDC的APR 为166%，记得处理
    
    输出为结构化JSON格式。
    """

    # 调用LLM获取分析结果
    messages = state["messages"] + [{"role": "user", "content": prompt}]
    response = llm.invoke(messages)

    # 解析结果
    try:
        # 确保response.content是字符串
        content = (
            response.content
            if isinstance(response.content, str)
            else str(response.content)
        )
        defi_analysis = json.loads(content)
    except:
        # 如果无法解析JSON，使用原始响应
        defi_analysis = {"analysis": str(response.content)}

    return {"defi_analysis": defi_analysis}


# 市场分析Agent：分析市场趋势和技术指标
async def market_analysis_agent(state: State):
    print("执行市场分析Agent...")

    # 获取市场数据
    market_data = state["market_data"]
    user_input = state["user_input"]

    # 构建提示信息
    prompt = f"""
    你是一位加密市场分析专家。请基于以下市场数据分析市场趋势和投资机会。
    
    风险偏好: {user_input['risk_preference']}
    用户自定义提示: {user_input['custom_prompt']}
    
    市场数据:
    {json.dumps(market_data, indent=2, ensure_ascii=False)}
    
    请分析并提供以下内容:
    1. 主要加密资产(BTC, ETH, APT等)的市场趋势预测
    2. 技术指标分析和价格预测
    3. 基于用户风险偏好的市场机会评估（按比例分配，不需要具体金额）
    4. 综合风险评估
    
    输出为结构化JSON格式。
    """

    # 调用LLM获取分析结果
    messages = state["messages"] + [{"role": "user", "content": prompt}]
    response = llm.invoke(messages)

    # 解析结果
    try:
        # 确保response.content是字符串
        content = (
            response.content
            if isinstance(response.content, str)
            else str(response.content)
        )
        market_analysis = json.loads(content)
    except:
        # 如果无法解析JSON，使用原始响应
        market_analysis = {"analysis": str(response.content)}

    return {"market_analysis": market_analysis}


# 随机化资产分配的函数
def randomize_allocations(portfolio_data: Dict) -> Dict:
    """
    对投资组合的资产分配添加随机波动，确保总和为100%

    参数:
        portfolio_data: 包含投资组合数据的字典

    返回:
        添加随机波动后的投资组合数据
    """
    print("\n应用随机化到资产分配...")

    # 对每个时间段进行处理
    for timeframe in portfolio_data:
        all_positions = []
        # 收集所有仓位
        for platform in portfolio_data[timeframe]["platforms"]:
            for position in portfolio_data[timeframe]["platforms"][platform][
                "positions"
            ]:
                if "allocation" in position:
                    all_positions.append(position)

        if not all_positions:
            continue

        # 添加随机波动
        random_values = []
        for position in all_positions:
            allocation_str = position["allocation"]
            if isinstance(allocation_str, str) and "%" in allocation_str:
                allocation_value = float(allocation_str.replace("%", ""))
            else:
                allocation_value = float(allocation_str)

            # 添加-5%到+5%的随机波动
            random_value = allocation_value * (1 + random.uniform(-0.10, 0.10))
            # 确保值不小于0.1%
            random_value = max(0.1, random_value)
            random_values.append(random_value)

        # 归一化确保总和为100%
        total_random = sum(random_values)
        scaling_factor = 100 / total_random

        # 更新仓位
        for i, position in enumerate(all_positions):
            # 计算归一化后的值，保留2位小数
            adjusted_value = round(random_values[i] * scaling_factor, 2)
            # 如果是整数，添加小数部分
            if adjusted_value == int(adjusted_value):
                adjusted_value += random.randint(1, 99) / 100
                adjusted_value = round(adjusted_value, 2)
            position["allocation"] = f"{adjusted_value}%"

        # 最后一个位置特殊处理，确保总和精确为100%
        total_except_last = sum(
            float(p["allocation"].replace("%", "")) for p in all_positions[:-1]
        )
        last_value = round(100 - total_except_last, 2)
        all_positions[-1]["allocation"] = f"{last_value}%"

        print(f"  {timeframe}时间段的资产分配已随机化，总和为100%")

    return portfolio_data


# Portfolio Manager：生成最终投资组合建议
async def portfolio_manager(state: State):
    print("执行Portfolio Manager...")

    # 获取各种分析结果
    defi_analysis = state["defi_analysis"]
    market_analysis = state["market_analysis"]
    user_input = state["user_input"]

    # 构建提示信息
    prompt = f"""
    你是一位DeFi投资组合经理。请基于DeFi投研和市场分析结果，为用户生成不同时间段的投资组合分配方案，按照仓位比例而非具体金额进行分配。
    
    ## 用户信息
    - 风险偏好: {user_input['risk_preference']}
    - 用户自定义提示: {user_input['custom_prompt']}
    
    ## 分析数据
    - DeFi投研分析:
    {json.dumps(defi_analysis, indent=2, ensure_ascii=False)}
    
    - 市场分析:
    {json.dumps(market_analysis, indent=2, ensure_ascii=False)}
    
    ## 任务说明
    请为以下不同投资时间段生成投资策略：14天、30天、90天和180天。
    
    ## 时间段对风险评估的影响
    主要是由于币价波动对流动性池的影响：
    - 时间越长，价格波动风险越大
    - 对于看涨预期，价格区间应该偏高一些（但必须包含当前价格）vice versa
    - 更长期的投资应该选择更大的价格区间
    - 短期策略可以允许更高风险，长期投资应该选择更保守的资产配置
    
    ## 输出格式要求
    结果必须使用以下JSON格式，以不同时间段作为最外层：
    {{
      "14 Days": {{
        "expected_return": <预期收益百分比>,
        "risk_index": <风险指数，范围1-100>,
        "platforms": {{
          "Joule": {{
            "positions": [
              {{
                "asset": <资产名称，如"USDC", "BTC"等>,
                "action": <操作，如"lend", "borrow"等>,
                "allocation": <仓位比例，例如: "21.86%"不能是整数>,
                "rationale": <推荐理由>
              }}
            ]
          }},
          "Aries": {{
            "positions": [
              {{
                "asset": <资产名称，如"USDC", "APT"等>,
                "action": <操作，如"lend", "borrow"等>,
                "allocation": <仓位比例，例如: "23.11%"不能是整数>,
                "rationale": <推荐理由>
              }}
            ]
          }},
          "Hyperion": {{
            "positions": [
              {{
                "asset": <资产对，如"APT-USDC">,
                "action": "add_liquidity",
                "allocation": <仓位比例，例如: "48.21%"不能是整数>,
                "fee_tier": <费率层级，0.01, 0.05, 0.3, 1>,
                "price_range": {{
                  "lower": <价格下限>,
                  "upper": <价格上限>
                }},
                "rationale": <推荐理由>
              }}
            ]
          }}
        }}
      }},
      "30 Days": {{
        "expected_return": <预期收益百分比>,
        "risk_index": <风险指数，范围1-100>,
        "platforms": {{ ... 与14days格式相同 ... }}
      }},
      "90 Days": {{
        "expected_return": <预期收益百分比>,
        "risk_index": <风险指数，范围1-100>,
        "platforms": {{ ... 与14days格式相同 ... }}
      }},
      "180 Days": {{
        "expected_return": <预期收益百分比>,
        "risk_index": <风险指数，范围1-100>,
        "platforms": {{ ... 与14days格式相同 ... }}
      }}
    }}
    
    ## DeFi借贷平台指导原则
    1. 你只需要lend USDC 赚取利息，目前不需要borrow
    2. 尽量选择APR较高的借贷平台
    3. 尽量选择LTV较低意味着风险较低
    4. 尽量选择手续费较低的借贷平台
    5. 尽量选择流动性较好的借贷平台
    
    ## Hyperion流动性池指导原则
    1. Hyperion是Aptos上的去中心化交易所(DEX)，提供了流动性池功能,你需要向USDT-APT池子提供流动性，其他目前不考虑
    2. 投资者可以向池子提供流动性，获取交易费和激励奖励
    3. fee_tier是池子的费率，通常有0.01%, 0.05%, 0.3%, 1%等选择
    4. 需要指定价格范围(price_range)，表示愿意在哪个价格区间提供流动性
    5. 尽量保证价格区间处于预测价格区间内
    6. 尽量减少价格区间大小，让流动性更集中，但这样无常损失也越大，根据用户风险偏好设定区间,不同期投资价格区间不同
    7. 对于不同时间段的策略：
       - 14天策略：价格区间较窄，激进预测 风险最高
       - 30天策略：价格区间稍宽，中短期预测 风险较高 
       - 90天策略：价格区间较宽，考虑较长期 风险较低
       - 180天策略：价格区间最宽，风险最低
       - 短期策略可以允许更高风险，长期投资应该选择更保守的资产配置
    
    ## 风险指数评估准则
    1. 风险指数范围为1-100，数值越高表示风险越大
    2. 风险指数考虑以下因素:
       - 资产波动性：波动性越大，风险指数越高
       - 流动性：流动性越低，风险指数越高
       - 平台安全性：平台安全性越低，风险指数越高
       - 投资期限：期限越长，风险指数越高
       - 资产分散度：分散度越低，风险指数越高
    3. 风险指数与用户风险偏好的对应关系:
       - 低风险偏好用户：建议风险指数在1-40之间
       - 中等风险偏好用户：建议风险指数在30-70之间
       - 高风险偏好用户：可接受风险指数在60-100之间
    4. 不同时间段的风险指数参考:
       - 14天策略：根据风险偏好，指数范围可能在30-90之间
       - 30天策略：根据风险偏好，指数范围可能在25-85之间
       - 90天策略：根据风险偏好，指数范围可能在20-80之间
       - 180天策略：根据风险偏好，指数范围可能在15-75之间
    
    ## 重要提示
    - "rationale": <推荐理由>这一项尽量简短
    - 只需要添加流动性以及lend usdc 不需要其他操作
    - 请直接输出JSON，不要使用Markdown代码块或其他格式
    - 必须严格按照上述JSON格式输出
    - est APY 要实际计算，给出计算过程,你需要计算每个仓位的APY然后加权平均 ，之后在按照时间计算实际预期return
    - 只需要添加流动性以及lend usdc 不需要其他操作,只需要考虑usdc以及apt代币lend APY有%3额外bonus 以及usdc-apt池子 APY166%,usdt 
    - 确保所有平台都有分配
    """

    # 调用LLM获取投资组合建议
    messages = state["messages"] + [{"role": "user", "content": prompt}]
    response = llm_plus.invoke(messages)  # 使用更强的模型

    # 解析结果
    try:
        # 确保response.content是字符串
        content = (
            response.content
            if isinstance(response.content, str)
            else str(response.content)
        )

        # 尝试从可能的Markdown代码块中提取JSON
        if "```json" in content and "```" in content:
            # 提取JSON部分
            start_idx = content.find("```json") + 7
            end_idx = content.rfind("```")
            if start_idx > 7 and end_idx > start_idx:
                content = content[start_idx:end_idx].strip()

        # 解析JSON
        portfolio_recommendation = json.loads(content)

        # 验证结果中包含四个时间段
        required_timeframes = ["14days", "30days", "90days", "180days"]
        missing_timeframes = [
            t for t in required_timeframes if t not in portfolio_recommendation
        ]

        if missing_timeframes:
            print(
                f"警告：缺少以下时间段 {', '.join(missing_timeframes)}"
            )
        # 验证资产类型是否符合要求
        allowed_assets = ["USDC", "APT", "APT-USDC"]
        invalid_assets = []

        # 遍历所有时间段和平台检查资产类型
        for timeframe in portfolio_recommendation:
            for platform in portfolio_recommendation[timeframe]["platforms"]:
                for position in portfolio_recommendation[timeframe]["platforms"][platform]["positions"]:
                    if position.get("asset") not in allowed_assets:
                        invalid_assets.append(position.get("asset"))

        if invalid_assets:
            print(f"警告：发现不允许的资产类型: {', '.join(set(invalid_assets))}")
            print("只允许使用以下资产类型: USDC, APT, APT-USDC")
            print("注意: Joule和Aries平台只允许USDC资产，Hyperion平台只允许APT-USDC资产")

            # 自动修正资产类型
            for timeframe in portfolio_recommendation:
                for platform in portfolio_recommendation[timeframe]["platforms"]:
                    if platform in ["Joule", "Aries"]:
                        for position in portfolio_recommendation[timeframe]["platforms"][platform]["positions"]:
                            if position.get("asset") != "USDC":
                                print(f"自动修正: 将{platform}平台的{position.get('asset')}资产改为USDC")
                                position["asset"] = "USDC"
                                position["action"] = "lend"
                    elif platform == "Hyperion":
                        for position in portfolio_recommendation[timeframe]["platforms"][platform]["positions"]:
                            if position.get("asset") != "APT-USDC":
                                print(f"自动修正: 将Hyperion平台的{position.get('asset')}资产改为APT-USDC")
                                position["asset"] = "APT-USDC"
                                position["action"] = "add_liquidity"
        # 验证每个时间段内的资产分配总和是否为100%
        for timeframe in portfolio_recommendation:
            total_allocation = 0
            allocations_by_platform = {}

            for platform in portfolio_recommendation[timeframe]["platforms"]:
                platform_allocation = 0
                for position in portfolio_recommendation[timeframe]["platforms"][platform]["positions"]:
                    # 提取百分比数值（去掉%符号并转换为浮点数）
                    if "allocation" in position:
                        allocation_str = position["allocation"]
                        if isinstance(allocation_str, str) and "%" in allocation_str:
                            allocation_value = float(allocation_str.replace("%", ""))
                        else:
                            allocation_value = float(allocation_str)

                        platform_allocation += allocation_value
                        total_allocation += allocation_value

                allocations_by_platform[platform] = platform_allocation

            # 检查总分配是否接近100%（允许小误差）
            if abs(total_allocation - 100) > 1:
                print(f"警告：{timeframe}时间段的资产分配总和为{total_allocation}%，不等于100%")
                print(f"各平台分配：{allocations_by_platform}")

                # 直接添加随机数并归一化
                print(f"调整{timeframe}时间段的资产分配比例并添加随机波动...")

                all_positions = []
                # 收集所有仓位
                for platform in portfolio_recommendation[timeframe]["platforms"]:
                    for position in portfolio_recommendation[timeframe]["platforms"][platform]["positions"]:
                        if "allocation" in position:
                            all_positions.append(position)

                # 添加随机波动
                random_values = []
                for position in all_positions:
                    allocation_str = position["allocation"]
                    if isinstance(allocation_str, str) and "%" in allocation_str:
                        allocation_value = float(allocation_str.replace("%", ""))
                    else:
                        allocation_value = float(allocation_str)

                    # 添加-5%到+5%的随机波动
                    random_value = allocation_value * (1 + random.uniform(-0.05, 0.05))
                    # 确保值不小于0.1%
                    random_value = max(0.1, random_value)
                    random_values.append(random_value)

                # 归一化确保总和为100%
                total_random = sum(random_values)
                scaling_factor = 100 / total_random

                # 更新仓位
                for i, position in enumerate(all_positions):
                    # 计算归一化后的值，保留2位小数
                    adjusted_value = round(random_values[i] * scaling_factor, 2)
                    # 如果是整数，添加小数部分
                    if adjusted_value == int(adjusted_value):
                        adjusted_value += random.randint(1, 99) / 100
                        adjusted_value = round(adjusted_value, 2)
                    position["allocation"] = f"{adjusted_value}%"

                # 最后一个位置特殊处理，确保总和精确为100%
                if all_positions:
                    total_except_last = sum(
                        float(p["allocation"].replace("%", ""))
                        for p in all_positions[:-1]
                    )
                    last_value = round(100 - total_except_last, 2)
                    all_positions[-1]["allocation"] = f"{last_value}%"

                print(f"{timeframe}时间段的资产分配已调整为100%并添加随机波动")
    except Exception as e:
        # 如果无法解析JSON，返回错误信息和原始响应
        print(f"解析JSON失败: {str(e)}")
        portfolio_recommendation = {
            "14days": {
                "expected_return": 5,
                "risk_index": 30,
                "platforms": {
                    "Joule": {"positions": []},
                    "Aries": {"positions": []},
                    "Hyperion": {"positions": []},
                },
            },
            "30days": {
                "expected_return": 8,
                "risk_index": 40,
                "platforms": {
                    "Joule": {"positions": []},
                    "Aries": {"positions": []},
                    "Hyperion": {"positions": []},
                },
            },
            "90days": {
                "expected_return": 15,
                "risk_index": 60,
                "platforms": {
                    "Joule": {"positions": []},
                    "Aries": {"positions": []},
                    "Hyperion": {"positions": []},
                },
            },
            "180days": {
                "expected_return": 25,
                "risk_index": 75,
                "platforms": {
                    "Joule": {"positions": []},
                    "Aries": {"positions": []},
                    "Hyperion": {"positions": []},
                },
            },
        }

    # 应用随机化到资产分配
    portfolio_recommendation = randomize_allocations(portfolio_recommendation)

    # 将结果保存为JSON文件
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(current_dir, "strategy.json")

        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(portfolio_recommendation, f, ensure_ascii=False, indent=2)

        print(f"策略已保存至: {file_path}")
    except Exception as e:
        print(f"保存策略文件失败: {e}")

    return {"portfolio_recommendation": portfolio_recommendation}


# 主函数
async def run_investment_advisor(
    risk_preference: str, custom_prompt: Optional[str] = ""
):
    """
    运行投资顾问系统

    参数:
        risk_preference: 风险偏好，可选值: "low"(低), "medium"(中), "high"(高)
        custom_prompt: 用户自定义提示

    返回:
        投资组合建议（JSON格式）
    """
    print(f"开始执行投资分析，风险偏好: {risk_preference}...")

    # 确保custom_prompt是字符串
    custom_prompt = custom_prompt or ""

    # 获取市场数据
    market_data = await get_marketdata(save_to_csv=False, print_overview=False)

    # 初始化系统状态
    state: State = {
        "messages": [],
        "market_data": market_data,
        "defi_analysis": {},
        "market_analysis": {},
        "portfolio_recommendation": {},
        "user_input": {
            "risk_preference": risk_preference,
            "custom_prompt": custom_prompt,
        },
    }

    # 顺序执行各个代理，避免嵌套事件循环
    print("\n1. 执行DeFi投研分析...")
    defi_result = await defi_research_agent(state)
    state["defi_analysis"] = defi_result["defi_analysis"]

    print("\n2. 执行市场分析...")
    market_result = await market_analysis_agent(state)
    state["market_analysis"] = market_result["market_analysis"]

    print("\n3. 生成投资组合建议...")
    portfolio_result = await portfolio_manager(state)
    state["portfolio_recommendation"] = portfolio_result["portfolio_recommendation"]

    # 返回投资组合建议
    return state["portfolio_recommendation"]


# 示例用法
if __name__ == "__main__":
    # 中等风险偏好，关注APT生态系统
    result = asyncio.run(
        run_investment_advisor(
            risk_preference="medium",
            custom_prompt="我想关注APT生态系统的机会，同时保持一部分资金在稳定币中，我期望年化收益10%",
        )
    )

    print("\n最终多时间段投资策略建议:")
    print("=" * 60)

    # 显示每个时间段的策略摘要
    for period in ["14days", "30days", "90days", "180days"]:
        if period in result:
            period_data = result[period]
            expected_return = period_data.get("expected_return", "N/A")
            risk_index = period_data.get("risk_index", "N/A")

            print(f"\n{period} 策略:")
            print(f"预期收益率: {expected_return}%")
            print(f"风险指数: {risk_index}/100")

            # 输出详细的平台仓位分配
            if "platforms" in period_data:
                platforms = period_data["platforms"]
                for platform_name, platform_data in platforms.items():
                    print(f"\n  {platform_name}:")
                    if "positions" in platform_data:
                        positions = platform_data["positions"]
                        if not positions:
                            print("    无仓位分配")
                        for pos in positions:
                            asset = pos.get("asset", "未知资产")
                            action = pos.get("action", "未知操作")
                            allocation = pos.get("allocation", "未知比例")
                            print(f"    • {asset} ({action}): {allocation}")

    # 输出完整JSON
    print("\n\n完整JSON输出:")
    print(json.dumps(result, indent=2, ensure_ascii=False))

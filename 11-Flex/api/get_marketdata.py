import asyncio
import pandas as pd
from typing import Dict, List, Optional, Union
from datetime import datetime

# 导入各模块功能

from crwaler.aires_crawler import get_aires_data
from crwaler.joule_finance_crawler import get_joule_finance_data
from crwaler.market_analyzer import get_market_analysis
from crwaler.hyperion_crawler import get_hyperion_data


async def get_all_platform_data() -> Dict:
    """获取所有平台数据"""
    print("开始获取多平台数据...")

    # 获取 Aires 数据
    print("\n1. 获取 Aires Markets 数据...")
    aires_data = await get_aires_data()
    if not aires_data:
        print("Aires Markets 数据获取失败")
    else:
        print(f"获取到 {len(aires_data)} 个Aires资产数据")

    # 获取 Joule Finance 数据
    print("\n2. 获取 Joule Finance 数据...")
    try:
        joule_data = get_joule_finance_data()
        if not joule_data:
            print("Joule Finance 数据获取失败")
        else:
            print(f"获取到 {len(joule_data)} 个Joule资产数据")
    except Exception as e:
        print(f"Joule Finance 数据获取失败: {e}")
        joule_data = {}

    # 获取 Hyperion 数据
    print("\n3. 获取 Hyperion 流动性池数据...")
    try:
        hyperion_data = await get_hyperion_data()
        if not hyperion_data:
            print("Hyperion 数据获取失败")
        else:
            print(f"获取到 {len(hyperion_data)} 个Hyperion流动性池数据")
    except Exception as e:
        print(f"Hyperion 数据获取失败: {e}")
        hyperion_data = {}

    # 合并数据
    print("\n4. 合并平台数据...")
    merged_data = merge_platform_data(aires_data, joule_data, hyperion_data)
    return merged_data


def merge_platform_data(
    aires_data: Dict, joule_data: Dict, hyperion_data: Dict
) -> Dict:
    """合并三个平台的数据"""
    merged_data = {}

    # 标准化代币名称映射
    token_mapping = {
        "WBTC": "BTC",
        "zWBTC": "BTC",
        "WETH": "ETH",
        "zWETH": "ETH",
        "USDt": "USDT",
        "sUSDe": "USDE",
        "TruAPT": "APT",
    }

    # 合并数据
    # 处理Joule数据
    for token, data in joule_data.items():
        normalized_token = token_mapping.get(token, token)

        if normalized_token not in merged_data:
            merged_data[normalized_token] = {}

        merged_data[normalized_token]["joule"] = {
            "ltv": data.get("ltv", 0) * 100,  # 转换为百分比
            "market_size": float(data.get("marketSize", 0)),
            "total_borrowed": float(data.get("totalBorrowed", 0)),
            "liquidation_factor": data.get("liquidationFactor", 0),
            "price": data.get("price", 0),
            "borrow_apy": data.get("borrowApy", 0),
            "deposit_apy": data.get("depositApy", 0),
        }

    # 处理Aires数据
    for token, data in aires_data.items():
        normalized_token = token_mapping.get(token, token)

        if normalized_token not in merged_data:
            merged_data[normalized_token] = {}

        merged_data[normalized_token]["aires"] = {
            "ltv": data.get("LTV", 0),
            "market_size": data.get("Market_Size_Amount", 0),
            "market_size_usd": data.get("Market_Size_USD", 0),
            "total_borrowed": data.get("Total_Borrowed_Amount", 0),
            "total_borrowed_usd": data.get("Total_Borrowed_USD", 0),
            "price": data.get("Price", 0),
            "borrow_apy": data.get("Borrow_APY", 0),
            "deposit_apy": data.get("Deposit_APY", 0),
        }

    # 处理Hyperion数据
    if hyperion_data:
        merged_data["hyperion_pools"] = {}
        for pool_name, pool_data in hyperion_data.items():
            merged_data["hyperion_pools"][pool_name] = {
                "tokens": pool_data.get("tokens", []),
                "fee_tier": pool_data.get("fee_tier", 0),
                "tvl": pool_data.get("tvl", 0),
                "volume_24h": pool_data.get("volume_24h", 0),
                "fees_24h": pool_data.get("fees_24h", 0),
                "apr": pool_data.get("apr", 0),
                "has_rewards": pool_data.get("has_rewards", False),
            }

    return merged_data


def enrich_with_technical_analysis(
    merged_data: Dict, symbols: Optional[List[str]] = None
) -> Dict:
    """用技术分析数据丰富合并后的数据"""
    if symbols is None:
        # 只分析已有的常见代币
        symbols = ["BTC", "ETH", "APT"]

    # 获取技术分析数据
    tech_analysis = get_market_analysis(symbols)

    # 将技术分析添加到合并数据中
    for result in tech_analysis:
        symbol = result["symbol"]
        if symbol in merged_data:
            merged_data[symbol]["technical_analysis"] = {
                "current_price": result["current_price"],
                "prediction_ranges": result["prediction_ranges"],
                "mean_reversion": result["mean_reversion"],
                "indicators": result["technical_indicators"],
                "summary": result["analysis_summary"],
            }

    return merged_data


def print_market_overview(data: Dict) -> None:
    """打印市场概览"""
    print("\n市场数据概览:")
    print("=" * 50)

    # 打印代币数据
    for token, platforms in data.items():
        if token == "hyperion_pools":  # 跳过Hyperion池数据，单独处理
            continue

        print(f"\n{token}:")

        # Aires数据
        if "aires" in platforms:
            aires = platforms["aires"]
            print(f"  Aires Markets:")
            print(f"    LTV: {aires['ltv']}%")
            print(f"    市场规模: ${aires['market_size_usd']:,.2f}")
            print(f"    借贷量: ${aires['total_borrowed_usd']:,.2f}")
            print(f"    存款利率: {aires['deposit_apy']}%")
            print(f"    借贷利率: {aires['borrow_apy']}%")

        # Joule数据
        if "joule" in platforms:
            joule = platforms["joule"]
            print(f"  Joule Finance:")
            print(f"    LTV: {joule['ltv']}%")
            print(f"    市场规模: ${joule['market_size']:,.2f}")
            print(f"    借贷量: ${joule['total_borrowed']:,.2f}")
            print(f"    存款利率: {joule['deposit_apy']}%")
            print(f"    借贷利率: {joule['borrow_apy']}%")

        # 技术分析
        if "technical_analysis" in platforms:
            ta = platforms["technical_analysis"]
            print(f"  技术分析 (Binance价格: ${ta['current_price']}):")
            print(f"    预测区间:")
            for period, ranges in ta["prediction_ranges"].items():
                print(
                    f"      {period.capitalize()}: ${ranges['lower']:.2f} - ${ranges['upper']:.2f} (波动: {ranges['width']:.2f}%)"
                )

            z_score = ta["mean_reversion"]["z_score"]
            if abs(z_score) > 2:
                trend = "下跌" if z_score > 0 else "上涨"
                print(f"    均值回归: 可能{trend} (Z-Score: {z_score:.2f})")

    # 单独打印Hyperion池数据
    if "hyperion_pools" in data:
        print("\nHyperion流动性池:")
        print("-" * 50)

        pools = data["hyperion_pools"]
        for pool_name, pool_data in pools.items():
            print(f"\n  {pool_name}:")
            print(f"    费率: {pool_data['fee_tier']}%")
            print(f"    TVL: ${pool_data['tvl']:,.2f}")
            print(f"    24h交易量: ${pool_data['volume_24h']:,.2f}")
            print(f"    24h费用: ${pool_data['fees_24h']:,.2f}")
            print(f"    APR: {pool_data['apr']}%")
            print(f"    有激励: {'是' if pool_data['has_rewards'] else '否'}")


def save_data_to_csv(data: Dict) -> str:
    """保存数据到CSV文件"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"crypto_market_data_{timestamp}.csv"

    # 准备数据
    rows = []
    for token, platforms in data.items():
        if token == "hyperion_pools":  # 跳过Hyperion池数据，单独处理
            continue

        row = {"Asset": token}

        # Aires数据
        if "aires" in platforms:
            for key, value in platforms["aires"].items():
                row[f"Aires_{key}"] = value

        # Joule数据
        if "joule" in platforms:
            for key, value in platforms["joule"].items():
                row[f"Joule_{key}"] = value

        # 技术分析摘要
        if "technical_analysis" in platforms:
            row["Binance_price"] = platforms["technical_analysis"]["current_price"]
            row["Daily_lower"] = platforms["technical_analysis"]["prediction_ranges"][
                "daily"
            ]["lower"]
            row["Daily_upper"] = platforms["technical_analysis"]["prediction_ranges"][
                "daily"
            ]["upper"]
            row["Z_score"] = platforms["technical_analysis"]["mean_reversion"][
                "z_score"
            ]

        rows.append(row)

    # 创建主要代币DataFrame并保存
    main_df = pd.DataFrame(rows)
    main_df.to_csv(filename, index=False)
    print(f"\n代币数据已保存到: {filename}")

    # 保存Hyperion数据
    if "hyperion_pools" in data:
        hyperion_filename = f"hyperion_pools_{timestamp}.csv"
        hyperion_rows = []

        for pool_name, pool_data in data["hyperion_pools"].items():
            row = {
                "Pool": pool_name,
                "Token0": (
                    pool_data["tokens"][0] if len(pool_data["tokens"]) > 0 else ""
                ),
                "Token1": (
                    pool_data["tokens"][1] if len(pool_data["tokens"]) > 1 else ""
                ),
                "Fee_Tier": pool_data["fee_tier"],
                "TVL": pool_data["tvl"],
                "Volume_24h": pool_data["volume_24h"],
                "Fees_24h": pool_data["fees_24h"],
                "APR": pool_data["apr"],
                "Has_Rewards": pool_data["has_rewards"],
            }
            hyperion_rows.append(row)

        hyperion_df = pd.DataFrame(hyperion_rows)
        hyperion_df.to_csv(hyperion_filename, index=False)
        print(f"Hyperion池数据已保存到: {hyperion_filename}")

    return filename


async def get_marketdata(save_to_csv: bool = True, print_overview: bool = True) -> Dict:
    """获取所有市场数据并进行整合"""
    # 获取平台数据
    merged_data = await get_all_platform_data()

    # 分析哪些代币有Binance数据
    common_tokens = [
        token
        for token in merged_data
        if token in ["BTC", "ETH", "APT"] and token != "hyperion_pools"
    ]

    # 添加技术分析
    enriched_data = enrich_with_technical_analysis(merged_data, common_tokens)

    # 打印概览
    if print_overview:
        print_market_overview(enriched_data)

    # 保存数据
    if save_to_csv:
        save_data_to_csv(enriched_data)

    return enriched_data


if __name__ == "__main__":
    # 运行主函数
    asyncio.run(get_marketdata())

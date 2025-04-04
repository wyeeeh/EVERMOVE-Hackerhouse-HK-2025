import asyncio
import pandas as pd
import re
import json
from datetime import datetime

# Hyperion样本数据
HYPERION_BACKUP_DATA = """
USDt-USDC
0.01%
$2.82M
$5.28M
$528.31
🎁
75.03%
10.59%

Deposit


APT-amAPT
0.01%
$2.27M
$12.53K
$1.25
0.02%

Deposit


APT-USDt
0.05%
$1.34M
$3M
$1.5K
🎁
129.77%
49.28%

Deposit


APT-USDC
0.05%
$808.18K
$2.74M
$1.37K
🎁
178.92%
76.15%

Deposit


USDt-USDC
0.05%
$1.91K
$0
$0
0%

Deposit


APT-lzUSDC
1%
$108.69
$11.6
$0.12
40.67%

Deposit


APT-amAPT
0.3%
$61.44
$0
$0
0%

Deposit


APT-USDC
0.3%
$15.44
$1.34
$0
10.16%

Deposit
"""


def parse_hyperion_pools_text(text_content):
    """解析文本内容中的Hyperion池数据"""
    # 分割为单独的池条目
    pool_entries = re.split(r"\n\s*\n+", text_content)

    pools = []
    for entry in pool_entries:
        lines = entry.strip().split("\n")
        if len(lines) < 6:  # 至少需要足够的行
            continue

        # 提取池名称和手续费
        pool_info = lines[0].strip()
        if not pool_info or "-" not in pool_info:
            continue

        # 提取代币对和费率
        tokens = pool_info.split("-")
        if len(tokens) != 2:
            continue

        token0 = tokens[0].strip()
        token1 = tokens[1].strip()

        # 提取费率
        fee_line = lines[1].strip() if len(lines) > 1 else ""
        fee_percent = None
        if "%" in fee_line:
            fee_percent = float(fee_line.replace("%", ""))

        # 提取TVL
        tvl_line = lines[2].strip() if len(lines) > 2 else ""
        tvl = 0.0
        if "$" in tvl_line:
            # 解析金额，例如 $2.82M 或 $808.18K
            try:
                tvl_clean = tvl_line.replace("$", "")
                if "M" in tvl_clean:
                    tvl = float(tvl_clean.replace("M", "")) * 1000000
                elif "K" in tvl_clean:
                    tvl = float(tvl_clean.replace("K", "")) * 1000
                else:
                    tvl = float(tvl_clean)
            except:
                tvl = 0.0

        # 提取交易量
        volume_line = lines[3].strip() if len(lines) > 3 else ""
        volume = 0.0
        if "$" in volume_line:
            try:
                volume_clean = volume_line.replace("$", "")
                if "M" in volume_clean:
                    volume = float(volume_clean.replace("M", "")) * 1000000
                elif "K" in volume_clean:
                    volume = float(volume_clean.replace("K", "")) * 1000
                else:
                    volume = float(volume_clean)
            except:
                volume = 0.0

        # 提取费用
        fees_line = lines[4].strip() if len(lines) > 4 else ""
        fees = 0.0
        if "$" in fees_line:
            try:
                fees_clean = fees_line.replace("$", "")
                if "K" in fees_clean:
                    fees = float(fees_clean.replace("K", "")) * 1000
                else:
                    fees = float(fees_clean)
            except:
                fees = 0.0

        # 提取APR
        apr_index = -1
        for i, line in enumerate(lines):
            if "%" in line and i > 4:  # 跳过费率行
                apr_index = i
                break

        apr = 0.0
        if apr_index != -1:
            apr_line = lines[apr_index].strip()
            try:
                apr_clean = re.search(r"([\d.]+)%", apr_line)
                if apr_clean:
                    apr = float(apr_clean.group(1))
            except:
                apr = 0.0

        # 构建池数据
        pool_data = {
            "pool_name": f"{token0}-{token1}",
            "token0": token0,
            "token1": token1,
            "fee_tier": fee_percent,
            "tvl": tvl,
            "volume_24h": volume,
            "fees_24h": fees,
            "apr": apr,
            "has_rewards": "🎁" in entry,
        }

        pools.append(pool_data)

    return pools


async def get_hyperion_pools():
    """获取Hyperion协议的流动性池信息"""
    print("正在获取Hyperion协议流动性池信息...")

    # 直接使用备用数据
    print("使用Hyperion备用数据...")
    pools = parse_hyperion_pools_text(HYPERION_BACKUP_DATA)
    print(f"提取了{len(pools)}个Hyperion流动性池信息")
    return pools


def format_hyperion_data(pools):
    """将Hyperion池数据格式化为可用的结构"""
    hyperion_data = {}

    for pool in pools:
        pool_name = pool["pool_name"]
        hyperion_data[pool_name] = {
            "tokens": [pool["token0"], pool["token1"]],
            "fee_tier": pool["fee_tier"],
            "tvl": pool["tvl"],
            "volume_24h": pool["volume_24h"],
            "fees_24h": pool["fees_24h"],
            "apr": pool["apr"],
            "has_rewards": pool["has_rewards"],
        }

    return hyperion_data


async def get_hyperion_data():
    """获取并处理Hyperion数据"""
    pools = await get_hyperion_pools()
    return format_hyperion_data(pools)


if __name__ == "__main__":
    # 测试函数
    pools = asyncio.run(get_hyperion_pools())

    if pools:
        print("\nHyperion流动性池信息:")
        for pool in pools:
            print(f"\n{pool['pool_name']}:")
            print(f"  代币: {pool['token0']}-{pool['token1']}")
            print(f"  费率: {pool['fee_tier']}%")
            print(f"  TVL: ${pool['tvl']:,.2f}")
            print(f"  24h交易量: ${pool['volume_24h']:,.2f}")
            print(f"  24h费用: ${pool['fees_24h']:,.2f}")
            print(f"  APR: {pool['apr']}%")
            print(f"  有激励: {'是' if pool['has_rewards'] else '否'}")

    # 测试格式化函数
    hyperion_data = format_hyperion_data(pools)
    print("\n\nHyperion数据 (字典格式):")
    print(json.dumps(hyperion_data, indent=2, ensure_ascii=False))

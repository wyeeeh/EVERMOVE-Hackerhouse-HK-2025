import asyncio
import pandas as pd
from datetime import datetime
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, BrowserConfig
from crawl4ai.async_configs import CacheMode
import re
from bs4 import BeautifulSoup
import talib


def clean_price(value):
    """清理价格数据"""
    if "$" in value:
        return value.split("$")[-1].replace(",", "")
    return value


def clean_percentage(value):
    """清理百分比数据，返回float类型"""
    try:
        if "%" in value:
            # 处理复合百分比，如 "6.42%0.00%+6.42%"
            percentages = [
                float(x.strip("%"))
                for x in value.split("%")
                if x.strip() and not x.startswith("+")
            ]
            return float(percentages[0]) if percentages else 0.0
        return 0.0
    except:
        return 0.0


def clean_amount(value):
    """清理数量数据"""
    if " " in value:
        amount = value.split(" ")[0].replace(",", "")
        return amount
    return value


def get_token_symbol(value):
    """提取代币符号"""
    if " " in value:
        return value.split(" ")[1].split("$")[0]
    return ""


def process_aires_data(raw_data):
    """处理Aires Markets的数据"""
    processed_data = []
    seen_assets = set()  # 用于跟踪已处理的资产

    for row in raw_data:
        asset_name = row[0]  # Asset Name 列

        # 跳过空资产名称的行
        if not asset_name:
            continue

        # 检查是否已处理过该资产
        asset_symbol = asset_name.split("$")[0] if "$" in asset_name else asset_name
        if asset_symbol in seen_assets:
            continue

        seen_assets.add(asset_symbol)

        market_size = row[3]  # Market Size 列
        total_borrowed = row[5]  # Total Borrowed 列
        wallet = row[6]  # Wallet 列

        processed_row = {
            "Asset": asset_symbol,
            "Price": float(clean_price(asset_name) or 0),
            "LTV": float(row[1].strip("%") or 0),  # LTV 列
            "Deposit_APY": clean_percentage(row[2]),  # 现在返回float
            "Market_Size_Amount": float(clean_amount(market_size) or 0),
            "Market_Size_Token": get_token_symbol(market_size),
            "`Market_Size_USD`": float(clean_price(market_size) or 0),
            "Borrow_APY": clean_percentage(row[4]),  # 现在返回float
            "Total_Borrowed_Amount": float(clean_amount(total_borrowed) or 0),
            "Total_Borrowed_Token": get_token_symbol(total_borrowed),
            "Total_Borrowed_USD": float(clean_price(total_borrowed) or 0),
            "Wallet_Amount": float(clean_amount(wallet) or 0),
            "Wallet_Token": get_token_symbol(wallet),
        }
        processed_data.append(processed_row)

    return pd.DataFrame(processed_data)


def parse_html_table(html_content):
    """从HTML中解析表格数据"""
    try:
        soup = BeautifulSoup(html_content, "html.parser")

        # 查找表格数据
        headers = []
        rows = []

        # 查找所有包含资产信息的行
        asset_rows = soup.find_all("tr")

        for row in asset_rows:
            cols = row.find_all(["td", "th"])
            if not cols:
                continue

            # 提取文本内容
            row_data = []
            for col in cols:
                # 移除所有图片标签
                for img in col.find_all("img"):
                    img.decompose()
                text = col.get_text(strip=True)
                row_data.append(text)

            if "Asset Name" in row_data:
                headers = row_data
            elif row_data and len(row_data) >= 7:  # 确保行数据完整
                rows.append(row_data)

        if not headers or not rows:
            print("未找到有效的表格数据")
            return None, None

        # 创建原始DataFrame
        raw_df = pd.DataFrame(rows, columns=headers)

        # 处理数据
        processed_df = process_aires_data(rows)

        return raw_df, processed_df

    except Exception as e:
        print(f"解析HTML时出错: {e}")
        return None, None


async def crawl_aires_data():
    """爬取Aires Markets数据"""
    config = CrawlerRunConfig(
        scan_full_page=True,
        scroll_delay=0.5,
        cache_mode=CacheMode.BYPASS,
    )

    try:
        async with AsyncWebCrawler(config=BrowserConfig(headless=True)) as crawler:
            result = await crawler.arun(
                "https://app.ariesmarkets.xyz/lending", config=config
            )

            # 获取原始HTML内容
            html_content = str(result)
            if not html_content:
                print("未能获取页面内容")
                return None, None

            # 解析HTML表格
            return parse_html_table(html_content)

    except Exception as e:
        print(f"爬取过程出错: {e}")
        return None, None


async def get_aires_data():
    """获取Aires Markets数据，返回处理后的字典格式"""
    raw_df, processed_df = await crawl_aires_data()

    if processed_df is None or processed_df.empty:
        print("Aires数据获取失败")
        return {}

    # 将DataFrame转换为字典格式
    aires_data = {}
    for _, row in processed_df.iterrows():
        token = row["Asset"]
        aires_data[token] = {
            "Asset": token,
            "Price": row["Price"],
            "LTV": row["LTV"],
            "Deposit_APY": row["Deposit_APY"],
            "Market_Size_Amount": row["Market_Size_Amount"],
            "Market_Size_Token": row["Market_Size_Token"],
            "Market_Size_USD": row["`Market_Size_USD`"],
            "Borrow_APY": row["Borrow_APY"],
            "Total_Borrowed_Amount": row["Total_Borrowed_Amount"],
            "Total_Borrowed_Token": row["Total_Borrowed_Token"],
            "Total_Borrowed_USD": row["Total_Borrowed_USD"],
            "Wallet_Amount": row["Wallet_Amount"],
            "Wallet_Token": row["Wallet_Token"],
        }

    return aires_data


if __name__ == "__main__":
    # 测试新函数
    aires_data = asyncio.run(get_aires_data())
    print("Aires Markets数据:")
    for token, info in aires_data.items():
        print(f"\n{token}:")
        for key, value in info.items():
            print(f"  {key}: {value}")

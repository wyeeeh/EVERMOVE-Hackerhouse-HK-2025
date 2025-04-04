import pandas as pd
import numpy as np
import talib
import requests
from typing import Dict, List, Tuple


class MarketAnalyzer:
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
        }

    def fetch_kline_data(
        self, symbol: str, interval: str = "1d", limit: int = 500
    ) -> pd.DataFrame:
        """获取币安K线数据"""
        url = f"https://api.binance.com/api/v3/klines"
        params = {"symbol": f"{symbol}USDT", "interval": interval, "limit": limit}

        response = requests.get(url, params=params, headers=self.headers)
        data = response.json()

        df = pd.DataFrame(
            data,
            columns=[
                "timestamp",
                "open",
                "high",
                "low",
                "close",
                "volume",
                "close_time",
                "quote_volume",
                "trades",
                "taker_buy_base",
                "taker_buy_quote",
                "ignore",
            ],
        )

        df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
        for col in ["open", "high", "low", "close", "volume"]:
            df[col] = df[col].astype(float)
        return df

    def calculate_price_prediction_bands(
        self, close_prices: np.ndarray, period: int, std_multiplier: float = 2.0
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """计算价格预测区间"""
        # 计算移动平均线
        ma = pd.Series(close_prices).rolling(window=period).mean()
        # 计算标准差
        std = pd.Series(close_prices).rolling(window=period).std()
        # 计算布林带
        upper_band = ma + (std * std_multiplier)
        lower_band = ma - (std * std_multiplier)

        return upper_band.values, ma.values, lower_band.values

    def calculate_mean_reversion_indicators(
        self, close_prices: np.ndarray, volumes: np.ndarray
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """计算均值回归指标"""
        # Z-Score: 价格偏离程度
        ma20 = pd.Series(close_prices).rolling(window=20).mean()
        std20 = pd.Series(close_prices).rolling(window=20).std()
        z_score = (close_prices - ma20) / std20

        # RSI修正的动量指标
        rsi = talib.RSI(close_prices, timeperiod=14)
        rsi_ma = pd.Series(rsi).rolling(window=10).mean()
        momentum_signal = (rsi - rsi_ma) / rsi_ma

        # 成交量加权的价格压力指标
        vwap = (
            pd.Series(close_prices * volumes).rolling(window=20).sum()
            / pd.Series(volumes).rolling(window=20).sum()
        )
        price_pressure = (close_prices - vwap) / vwap

        return z_score.values, momentum_signal.values, price_pressure.values

    def calculate_technical_indicators(
        self, df: pd.DataFrame
    ) -> Tuple[pd.DataFrame, Dict, Dict]:
        """计算技术指标"""
        close_prices = df["close"].values
        high_prices = df["high"].values
        low_prices = df["low"].values
        volumes = df["volume"].values

        # 基础移动平均线
        ma5 = talib.SMA(close_prices, timeperiod=5)
        ma10 = talib.SMA(close_prices, timeperiod=10)
        ma20 = talib.SMA(close_prices, timeperiod=20)
        ma60 = talib.SMA(close_prices, timeperiod=60)

        # RSI指标族
        rsi6 = talib.RSI(close_prices, timeperiod=6)
        rsi12 = talib.RSI(close_prices, timeperiod=12)
        rsi24 = talib.RSI(close_prices, timeperiod=24)

        # MACD
        macd, macd_signal, macd_hist = talib.MACD(
            close_prices, fastperiod=12, slowperiod=26, signalperiod=9
        )

        # KDJ
        k, d = talib.STOCH(
            high_prices,
            low_prices,
            close_prices,
            fastk_period=9,
            slowk_period=3,
            slowk_matype=talib.MA_Type.SMA,
            slowd_period=3,
            slowd_matype=talib.MA_Type.SMA,
        )
        j = 3 * k - 2 * d

        # 计算不同时间周期的布林带预测区间
        daily_upper, daily_ma, daily_lower = self.calculate_price_prediction_bands(
            close_prices, 20
        )  # 日线
        weekly_upper, weekly_ma, weekly_lower = self.calculate_price_prediction_bands(
            close_prices, 5
        )  # 周线
        monthly_upper, monthly_ma, monthly_lower = (
            self.calculate_price_prediction_bands(close_prices, 30)
        )  # 月线

        # 计算均值回归指标
        z_score, momentum_signal, price_pressure = (
            self.calculate_mean_reversion_indicators(close_prices, volumes)
        )

        # 计算最新的预测区间
        latest_idx = -1
        prediction_ranges = {
            "daily": {
                "upper": daily_upper[latest_idx],
                "middle": daily_ma[latest_idx],
                "lower": daily_lower[latest_idx],
                "width": (daily_upper[latest_idx] - daily_lower[latest_idx])
                / daily_ma[latest_idx]
                * 100,
            },
            "weekly": {
                "upper": weekly_upper[latest_idx],
                "middle": weekly_ma[latest_idx],
                "lower": weekly_lower[latest_idx],
                "width": (weekly_upper[latest_idx] - weekly_lower[latest_idx])
                / weekly_ma[latest_idx]
                * 100,
            },
            "monthly": {
                "upper": monthly_upper[latest_idx],
                "middle": monthly_ma[latest_idx],
                "lower": monthly_lower[latest_idx],
                "width": (monthly_upper[latest_idx] - monthly_lower[latest_idx])
                / monthly_ma[latest_idx]
                * 100,
            },
        }

        # 计算价格回归概率
        mean_reversion_probability = {
            "z_score": z_score[latest_idx],
            "momentum": momentum_signal[latest_idx],
            "price_pressure": price_pressure[latest_idx],
        }

        return (
            pd.DataFrame(
                {
                    "ma5": ma5,
                    "ma10": ma10,
                    "ma20": ma20,
                    "ma60": ma60,
                    "rsi6": rsi6,
                    "rsi12": rsi12,
                    "rsi24": rsi24,
                    "macd": macd,
                    "macd_signal": macd_signal,
                    "macd_hist": macd_hist,
                    "k": k,
                    "d": d,
                    "j": j,
                    "daily_upper": daily_upper,
                    "daily_lower": daily_lower,
                    "weekly_upper": weekly_upper,
                    "weekly_lower": weekly_lower,
                    "monthly_upper": monthly_upper,
                    "monthly_lower": monthly_lower,
                    "z_score": z_score,
                    "momentum_signal": momentum_signal,
                    "price_pressure": price_pressure,
                }
            ),
            prediction_ranges,
            mean_reversion_probability,
        )

    def analyze_trend(
        self,
        df: pd.DataFrame,
        indicators: pd.DataFrame,
        prediction_ranges: Dict,
        mean_reversion_probability: Dict,
    ) -> str:
        """分析趋势"""
        current_price = float(df["close"].iloc[-1])
        signals = []

        # MA分析
        ma5_current = indicators["ma5"].iloc[-1]
        ma10_current = indicators["ma10"].iloc[-1]
        ma20_current = indicators["ma20"].iloc[-1]

        if ma5_current > ma10_current > ma20_current:
            signals.append("短期、中期均线呈多头排列，上升趋势强劲")
        elif ma5_current < ma10_current < ma20_current:
            signals.append("短期、中期均线呈空头排列，下降趋势明显")

        # 价格区间分析
        for period in ["daily", "weekly", "monthly"]:
            range_data = prediction_ranges[period]
            signals.append(f"{period.capitalize()}预测区间:")
            signals.append(f"  上界: ${range_data['upper']:.2f}")
            signals.append(f"  中值: ${range_data['middle']:.2f}")
            signals.append(f"  下界: ${range_data['lower']:.2f}")
            signals.append(f"  波动范围: {range_data['width']:.2f}%")

        # 均值回归分析
        z_score = mean_reversion_probability["z_score"]
        momentum = mean_reversion_probability["momentum"]
        price_pressure = mean_reversion_probability["price_pressure"]

        if abs(z_score) > 2:
            if z_score > 0:
                signals.append(
                    f"价格显著高于均值(Z-Score: {z_score:.2f})，有下跌回归趋势"
                )
            else:
                signals.append(
                    f"价格显著低于均值(Z-Score: {z_score:.2f})，有上涨回归趋势"
                )

        if abs(momentum) > 0.1:
            if momentum > 0:
                signals.append("动量指标显示上涨趋势增强")
            else:
                signals.append("动量指标显示下跌趋势增强")

        if abs(price_pressure) > 0.05:
            if price_pressure > 0:
                signals.append("成交量显示存在卖出压力")
            else:
                signals.append("成交量显示存在买入压力")

        return "\n".join(signals)

    def analyze_market(self, symbol: str) -> Dict:
        """分析市场"""
        df = self.fetch_kline_data(symbol)
        indicators, prediction_ranges, mean_reversion_probability = (
            self.calculate_technical_indicators(df)
        )

        analysis = self.analyze_trend(
            df, indicators, prediction_ranges, mean_reversion_probability
        )

        result = {
            "symbol": symbol,
            "current_price": round(float(df["close"].iloc[-1]), 2),
            "prediction_ranges": prediction_ranges,
            "mean_reversion": mean_reversion_probability,
            "technical_indicators": {
                k: round(float(v), 2) if pd.notna(v) else v
                for k, v in indicators.iloc[-1].to_dict().items()
            },
            "analysis_summary": analysis,
        }

        return result


def get_market_analysis(symbols: List[str] = None) -> List[Dict]:
    """获取市场分析的便捷函数"""
    if symbols is None:
        symbols = ["BTC", "ETH", "APT"]

    analyzer = MarketAnalyzer()
    analysis_results = []

    for symbol in symbols:
        try:
            result = analyzer.analyze_market(symbol)
            analysis_results.append(result)
        except Exception as e:
            print(f"分析 {symbol} 时出错: {str(e)}")

    return analysis_results


if __name__ == "__main__":
    # 测试代码
    results = get_market_analysis()
    for result in results:
        print(f"\n{result['symbol']} 分析结果:")
        print(f"当前价格: ${result['current_price']}")
        print("\n预测区间:")
        for period, ranges in result["prediction_ranges"].items():
            print(f"\n{period.capitalize()}:")
            for k, v in ranges.items():
                print(f"  {k}: {v:.2f}")
        print("\n技术分析总结:")
        print(result["analysis_summary"])

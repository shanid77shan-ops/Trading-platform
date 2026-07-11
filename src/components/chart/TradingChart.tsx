"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  type IChartApi,
  type ISeriesApi,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
} from "lightweight-charts";

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

function generateCandles(basePrice: number, count = 80): CandleData[] {
  const candles: CandleData[] = [];
  let price = basePrice * 0.995;
  const now = Math.floor(Date.now() / 1000);

  for (let i = count; i >= 0; i--) {
    const volatility = basePrice * 0.0015;
    const open = price;
    const change = (Math.random() - 0.48) * volatility * 2;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility;
    const low = Math.min(open, close) - Math.random() * volatility;
    candles.push({
      time: now - i * 60,
      open,
      high,
      low,
      close,
    });
    price = close;
  }
  return candles;
}

interface TradingChartProps {
  price: number;
  positionPrice?: number;
  positionLabel?: string;
}

export function TradingChart({
  price,
  positionPrice,
  positionLabel,
}: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0b121c" },
        textColor: "#5a6a7e",
      },
      grid: {
        vertLines: { color: "#141c28" },
        horzLines: { color: "#141c28" },
      },
      rightPriceScale: {
        borderColor: "#1a2332",
      },
      timeScale: {
        borderColor: "#1a2332",
        timeVisible: true,
      },
      crosshair: {
        vertLine: { color: "#26a69a55" },
        horzLine: { color: "#26a69a55" },
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderUpColor: "#26a69a",
      borderDownColor: "#ef5350",
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    const candles = generateCandles(price);
    candleSeries.setData(
      candles.map((c) => ({
        time: c.time as unknown as import("lightweight-charts").Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
    );

    const emaColors = ["#f5c542", "#e8913a", "#e05c5c", "#c77dff", "#7b68ee"];
    candles.forEach((_, idx) => {
      if (idx < 5) return;
    });

    [5, 10, 20].forEach((period, i) => {
      const lineSeries = chart.addSeries(LineSeries, {
        color: emaColors[i],
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      const emaData = candles.map((c, idx) => {
        if (idx < period) return null;
        const slice = candles.slice(idx - period, idx);
        const avg = slice.reduce((s, x) => s + x.close, 0) / period;
        return { time: c.time as unknown as import("lightweight-charts").Time, value: avg };
      }).filter(Boolean) as { time: import("lightweight-charts").Time; value: number }[];
      lineSeries.setData(emaData);
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: "#26a69a55",
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });

    volumeSeries.setData(
      candles.map((c) => ({
        time: c.time as unknown as import("lightweight-charts").Time,
        value: Math.random() * 1000 + 200,
        color: c.close >= c.open ? "#26a69a66" : "#ef535066",
      }))
    );

    if (positionPrice && positionLabel) {
      candleSeries.createPriceLine({
        price: positionPrice,
        color: "#26a69a",
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: positionLabel,
      });
    }

    chart.timeScale().fitContent();
    chartRef.current = chart;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [price, positionPrice, positionLabel]);

  return (
    <div className="relative">
      <div className="absolute left-2 top-2 z-10 text-[9px] leading-tight text-[#5a6a7e]">
        <div>EMA5 EMA10 EMA20</div>
        <div>MA5 MA10 MA20</div>
      </div>
      <div ref={containerRef} className="h-[280px] w-full" />
    </div>
  );
}

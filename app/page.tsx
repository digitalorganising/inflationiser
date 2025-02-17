"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  InflationMeasure,
  getInflationStats,
  inflationGetter,
} from "./statistics";
import useSWR from "swr/immutable";
import { addMonths, addYears } from "./dates";

export default function Home() {
  const [inflationMeasure, setInflationMeasure] =
    useState<InflationMeasure>("cpi");
  const stats = useSWR(inflationMeasure, getInflationStats);
  const getInflation = useCallback(inflationGetter(stats.data), [stats.data]);
  const [start, setStart] = useState<string | undefined>();
  const [end, setEnd] = useState<string | undefined>();
  const [settlements, setSettlements] = useState<Record<string, number>>({});

  if (stats.error) {
    console.log(stats.error);
  }

  useEffect(() => {
    if (stats.data?.max) {
      if (!start) {
        setStart(addYears(stats.data?.max, -2));
      }
      if (!end) {
        setEnd(stats.data?.max);
      }
    }
  }, [stats.data?.max]);

  useEffect(() => {
    if (start && Object.keys(settlements).length === 0) {
      setSettlements({
        [start]: 0.0,
      });
    }
  }, [start]);

  return (
    <div className="w-full h-dvh flex items-center justify-center">
      <main className="border border-slate-300 shadow-md rounded-lg p-5">
        <h1 className="font-semibold text-2xl mb-3">Inflation vs Settlement</h1>
        <label htmlFor="inflation-measure">Inflation measure:</label>
        <select
          id="inflation-measure"
          value={inflationMeasure}
          onChange={(e) =>
            setInflationMeasure(e.target.value as InflationMeasure)
          }
          className="border border-slate-300 rounded-md ml-1"
        >
          <option value="cpi">CPI</option>
          <option value="cpih">CPIH</option>
          <option value="rpi">RPI</option>
        </select>
        {stats.isLoading ? (
          <span className="inline-block animate-spin">⏳</span>
        ) : null}
        {stats.error ? <span>⚠️ Error fetching inflation data!</span> : null}
        <div className="mt-4 flex items-end border-b border-b-slate-300 pb-3 mb-3">
          <div className="flex flex-col grow">
            <label
              className="font-semibold text-sm text-slate-600 mb-0.5"
              htmlFor="start-month"
            >
              Start of period
            </label>
            <input
              className="border border-slate-300 rounded-md p-1"
              id="start-month"
              type="month"
              max={end}
              min={stats.data?.min}
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-slate-600 mb-0.5">
            Settlements
          </h4>
          <div className="space-y-2">
            {Object.entries(settlements).map(([month, value]) => (
              <div
                key={`settlement-${month}`}
                className="flex items-stretch space-x-2"
              >
                <input
                  type="month"
                  value={month}
                  onChange={(e) =>
                    setSettlements(({ [month]: _, ...oldState }) => ({
                      ...oldState,
                      [e.target.value]: value,
                    }))
                  }
                  min={start}
                  max={end}
                  className="grow border border-slate-300 rounded-md p-1"
                />
                <input
                  id="figure"
                  type="number"
                  value={value.toFixed(1)}
                  onChange={(e) =>
                    setSettlements((s) => ({
                      ...s,
                      [month]: Number(e.target.value),
                    }))
                  }
                  min="0.0"
                  max="25.0"
                  step="0.1"
                  className="border border-slate-300 rounded-md p-1"
                />
                <button
                  className="border border-slate-300 rounded-md p-1"
                  onClick={() =>
                    addYears(month, 1) <= (stats.data?.max ?? "")
                      ? setSettlements((s) => ({
                          ...s,
                          [addYears(month, 1)]: 0.0,
                        }))
                      : undefined
                  }
                >
                  ➕
                </button>
                <button
                  className="border border-slate-300 rounded-md p-1 disabled:opacity-50"
                  disabled={Object.keys(settlements).length <= 1}
                  onClick={() =>
                    Object.keys(settlements).length > 1
                      ? setSettlements(
                          ({ [month]: _, ...settlements }) => settlements
                        )
                      : undefined
                  }
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-col border-t border-t-slate-300 pt-3 mt-3">
            <label
              className="font-semibold text-sm text-slate-600 mb-0.5"
              htmlFor="end-month"
            >
              End of period
            </label>
            <input
              className="border border-slate-300 rounded-md p-1"
              id="end-month"
              type="month"
              max={stats.data?.max}
              min={start}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

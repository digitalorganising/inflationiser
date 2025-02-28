"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  InflationMeasure,
  getInflationStats,
  inflationGetter,
} from "./statistics";
import useSWR from "swr/immutable";
import { addYears, nextMonth } from "./dates";
import Settlements from "./Settlements";
import Copyable from "./Copyable";

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

  const totalPay = Object.values(settlements).reduce((c, v) => c * (1 + v), 1);
  const totalInflation = start && end ? getInflation(start, end) : 0;

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
        [nextMonth(start, 4)]: 0.0,
      });
    }
  }, [start]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-5">
      <main className="border border-slate-300 shadow-md rounded-lg p-5 max-w-full">
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
        <div className="mt-4 flex items-stretch space-x-4 border-b border-b-slate-300 pb-4">
          <div className="flex flex-col grow">
            <label
              className="font-semibold text-sm text-slate-600 mb-0.5"
              htmlFor="start-month"
            >
              Start of period
            </label>
            {start && (
              <input
                className="border border-slate-300 rounded-md p-1"
                id="start-month"
                type="month"
                max={end}
                min={stats.data?.min}
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            )}
          </div>
        </div>
        <Settlements
          settlements={settlements}
          setSettlements={setSettlements}
          getInflation={getInflation}
          start={start}
          end={end}
        />
        <div className="flex flex-col border-t border-t-slate-300 py-4 border-b border-b-slate-300">
          <label
            className="font-semibold text-sm text-slate-600 mb-0.5"
            htmlFor="end-month"
          >
            End of period
          </label>
          {end && (
            <input
              className="border border-slate-300 rounded-md p-1"
              id="end-month"
              type="month"
              max={stats.data?.max}
              min={start}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          )}
        </div>
        <div className="flex space-x-4 mt-4 border-b border-b-slate-300 pb-4">
          <div className="flex flex-col text-right flex-1">
            <h4 className="font-semibold text-sm text-slate-600 mb-0.5 text-right whitespace-nowrap">
              Total inflation
            </h4>
            <Copyable className="border-2 border-purple-300 rounded-md p-1 bg-slate-100 text-right cursor-default active:border-purple-600">
              {(100 * (totalInflation - 1)).toFixed(2)}%
            </Copyable>
          </div>
          <div className="flex flex-col text-right flex-1">
            <h4 className="font-semibold text-sm text-slate-600 mb-0.5 text-right whitespace-nowrap">
              Total pay
            </h4>
            <Copyable className="border-2 border-amber-300 rounded-md p-1 bg-slate-100 text-right cursor-default active:border-amber-600">
              {(100 * (totalPay - 1)).toFixed(2)}%
            </Copyable>
          </div>
          <div className="flex flex-col text-right flex-1">
            <h4 className="font-semibold text-sm text-slate-600 mb-0.5 text-right whitespace-nowrap">
              Real terms pay
            </h4>
            <Copyable className="border-2 border-red-400 rounded-md p-1 bg-slate-100 text-right cursor-default active:border-red-600">
              {(100 * (1 - totalInflation / totalPay)).toFixed(2)}%
            </Copyable>
          </div>
        </div>
      </main>
    </div>
  );
}

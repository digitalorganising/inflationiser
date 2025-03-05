import { Dispatch, SetStateAction } from "react";
import Copyable from "./Copyable";
import { addMonths, addYears, nextMonth } from "./dates";
import { accumulatePercentageIncreases } from "./statistics";
import FloatInput from "./FloatInput";

type Props = {
  settlements: Record<string, number>;
  setSettlements: Dispatch<SetStateAction<Record<string, number>>>;
  getInflation: (start: string, end: string) => number;
  start?: string;
  end?: string;
};

const getNextSettlement =
  (end: string) =>
  (current: string): string | undefined =>
    [
      () => addYears(current, 1),
      () => nextMonth(current, 4),
      () => addMonths(current, 6),
      () => addMonths(current, 3),
      () => addMonths(current, 1),
    ].reduce<string | undefined>((nextSettlement, getDate) => {
      if (!nextSettlement) {
        const date = getDate();
        if (date <= end) {
          return date;
        }
      }
      return nextSettlement;
    }, undefined);

export default function Settlements({
  settlements,
  setSettlements,
  getInflation,
  start,
  end,
}: Props) {
  const nextSettlement = getNextSettlement(end ?? "");
  return (
    <div className="py-4">
      <div className="w-full flex">
        <h4 className="font-semibold text-sm text-slate-600 mb-0.5">
          Settlements
        </h4>
        <h4 className="font-semibold text-sm text-slate-600 mb-0.5 ml-auto px-1 text-right hidden sm:inline">
          Inflation / Pay / Real Pay
        </h4>
      </div>
      <div className="space-y-2">
        {Object.entries(settlements)
          .toSorted(([monthA, _], [monthB, __]) => monthA.localeCompare(monthB))
          .map(accumulatePercentageIncreases())
          .map(([month, value, cumulative]) => (
            <div
              key={`settlement-${month}`}
              className="flex items-stretch space-x-2"
            >
              <div className="flex flex-col">
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
                  className="border border-slate-300 rounded-md p-1 w-[125px] xs:w-auto"
                />
              </div>
              <FloatInput
                id="figure"
                value={100 * value}
                onChangeValue={(v) =>
                  setSettlements((s) => ({
                    ...s,
                    [month]: v / 100,
                  }))
                }
                precision={2}
                min="0.0"
                max="25.0"
                step="0.05"
                className="border border-slate-300 rounded-md p-1 min-w-[65px]"
              />
              <button
                className="border border-slate-300 rounded-md p-1 disabled:opacity-50"
                disabled={nextSettlement(month) === undefined}
                onClick={() =>
                  setSettlements((s) => ({
                    ...s,
                    [nextSettlement(month)!]: 0.0,
                  }))
                }
              >
                ➕
              </button>
              <button
                className="border border-slate-300 rounded-md p-1 disabled:opacity-50"
                disabled={Object.keys(settlements).length <= 1}
                onClick={() =>
                  setSettlements(
                    ({ [month]: _, ...settlements }) => settlements
                  )
                }
              >
                🗑️
              </button>
              <Copyable className="border-2 border-purple-300 rounded-md p-1 bg-slate-100 text-right cursor-default active:border-purple-600 hidden sm:block md:pl-5">
                {(start ? 100 * (getInflation(start, month) - 1) : 0).toFixed(
                  2
                )}
                %
              </Copyable>
              <Copyable className="border-2 border-amber-300 rounded-md p-1 bg-slate-100 text-right cursor-default active:border-amber-600 hidden sm:block md:pl-5">
                {(100 * (cumulative - 1)).toFixed(2)}%
              </Copyable>
              <Copyable className="border-2 border-red-400 rounded-md p-1 bg-slate-100 text-right cursor-default active:border-red-600 hidden sm:block md:pl-5">
                {(start
                  ? 100 * (1 - getInflation(start, month) / cumulative)
                  : 0
                ).toFixed(2)}
                %
              </Copyable>
            </div>
          ))}
      </div>
    </div>
  );
}

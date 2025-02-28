import { Dispatch, SetStateAction } from "react";
import Copyable from "./Copyable";
import { addYears } from "./dates";
import { accumulatePercentageIncreases } from "./statistics";
import FloatInput from "./FloatInput";

type Props = {
  settlements: Record<string, number>;
  setSettlements: Dispatch<SetStateAction<Record<string, number>>>;
  getInflation: (start: string, end: string) => number;
  start?: string;
  end?: string;
};

export default function Settlements({
  settlements,
  setSettlements,
  getInflation,
  start,
  end,
}: Props) {
  return (
    <div className="py-4">
      <div className="w-full flex">
        <h4 className="font-semibold text-sm text-slate-600 mb-0.5">
          Settlements
        </h4>
        <h4 className="font-semibold text-sm text-slate-600 mb-0.5 ml-auto w-[110px] px-1 text-right">
          Total inflation
        </h4>
        <h4 className="font-semibold text-sm text-slate-600 mb-0.5 ml-2 w-[80px] px-1 text-right">
          Total pay
        </h4>
        <h4 className="font-semibold text-sm text-slate-600 mb-0.5 ml-2 w-[120px] px-1 text-right">
          Real terms pay
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
                  className="grow border border-slate-300 rounded-md p-1"
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
                className="border border-slate-300 rounded-md p-1"
              />
              <button
                className="border border-slate-300 rounded-md p-1 disabled:opacity-50"
                disabled={addYears(month, 1) > (end ?? "")}
                onClick={() =>
                  setSettlements((s) => ({
                    ...s,
                    [addYears(month, 1)]: 0.0,
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
              <Copyable className="border-2 border-purple-300 rounded-md p-1 w-[110px] bg-slate-100 text-right cursor-default active:border-purple-600">
                {(start ? 100 * (getInflation(start, month) - 1) : 0).toFixed(
                  2
                )}
                %
              </Copyable>
              <Copyable className="border-2 border-amber-300 rounded-md p-1 w-[80px] bg-slate-100 text-right cursor-default active:border-amber-600">
                {(100 * (cumulative - 1)).toFixed(2)}%
              </Copyable>
              <Copyable className="border-2 border-red-400 rounded-md p-1 w-[120px] bg-slate-100 text-right cursor-default active:border-red-600">
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

import React, { useCallback, useState } from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  onChangeValue: (n: number) => void;
  precision: number;
}

const formatter = (precision: number) => (n: any) =>
  (
    Math.round(10 ** precision * parseFloat(n.toString())) /
    10 ** precision
  ).toFixed(precision);

export default function FloatInput({
  value,
  onChangeValue,
  precision,
  step,
  ...otherProps
}: Props) {
  const format = useCallback(formatter(precision), [precision]);
  const [innerValue, setInnerValue] = useState<string>(
    typeof value === "undefined" ? "" : format(value)
  );

  const setValues = (v: string) => {
    setInnerValue(v);
    onChangeValue(parseFloat(v));
  };

  return (
    <input
      type="number"
      value={innerValue}
      onChange={(e) => setValues(e.currentTarget.value)}
      onBlur={() =>
        typeof innerValue !== "undefined" && setValues(format(innerValue))
      }
      step={step ?? 10 ** (-1 * precision)}
      {...otherProps}
    />
  );
}

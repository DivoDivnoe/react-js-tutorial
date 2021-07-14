import { isNumber, isOpeningBrace, isClosingBrace } from "./helpers";
import { mathOperators, unarOperators, trigOperators } from "./mathOperators";

type NumOrString = number | string;
export type ParsedLineIterType = NumOrString[];
export type ParsedLineType = (NumOrString | ParsedLineType)[];

export const isValidNumber = (
  prevItem: NumOrString | ParsedLineType | undefined,
  item: number
): boolean => {
  return (
    !isNumber(String(prevItem)) &&
    !Array.isArray(prevItem) &&
    !unarOperators.includes(String(prevItem)) &&
    isNumber(String(item))
  );
};

export const isValidOperator = (
  prevItem: NumOrString | ParsedLineType | undefined,
  item: string
): boolean => {
  return (
    ((isNumber(String(prevItem)) || Array.isArray(prevItem)) &&
      mathOperators.hasOwnProperty(String(item))) ||
    (trigOperators.includes(String(item)) && !isNumber(String(prevItem)))
  );
};

export const parser = (line: string): ParsedLineType | null => {
  const stack = line.split(" ");

  let closingBraceIndex: number;

  const parserIter = (
    chunk: ParsedLineType,
    isRoot = true,
    startKey = 0
  ): ParsedLineType => {
    let braceFlag = true;
    const result: ParsedLineType = [];

    for (let key = 0; key < chunk.length && braceFlag; key++) {
      const item = chunk[key];

      if (isOpeningBrace(String(item))) {
        const chunkItem: ParsedLineType = parserIter(
          chunk.slice(key + 1),
          false,
          key + 1
        );

        result.push(chunkItem);
        key += closingBraceIndex - key;
      } else if (isClosingBrace(String(item))) {
        if (isRoot) {
          throw new TypeError("wrong braces amount");
        }

        closingBraceIndex = key + startKey;
        braceFlag = false;
      } else {
        const prevItem = result[result.length - 1];

        const isValidNumberPush = isValidNumber(prevItem, Number(item));
        const isValidOperatorPush = isValidOperator(prevItem, String(item));

        if (isValidNumberPush) {
          result.push(Number(item));
        } else if (isValidOperatorPush) {
          result.push(item);
        } else {
          throw new TypeError("Unexpected string");
        }
      }
    }

    if (!isRoot && braceFlag) {
      throw new TypeError("wrong braces amount");
    }

    return result;
  };

  return parserIter(stack);
};

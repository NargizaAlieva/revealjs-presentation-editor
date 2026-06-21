export const toRoman = (n) => {
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
  let result = "";
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) { result += syms[i]; n -= vals[i]; }
  }
  return result;
};

const LIST_INDENT_PX = 24;
export const MAX_LIST_INDENT_LEVEL = 4;

export const getListIndent = (level, listType) =>
  listType ? `${(Math.min(level, MAX_LIST_INDENT_LEVEL) + 1) * LIST_INDENT_PX}px` : "0px";

export const getListMarker = (index, listType, listMarker, listNumberedStyle) => {
  if (listType === "bullets") return listMarker ?? "•";
  const n = index + 1;
  switch (listNumberedStyle) {
    case "lower-alpha": return `${String.fromCharCode(96 + n)}.`;
    case "upper-alpha": return `${String.fromCharCode(64 + n)}.`;
    case "lower-roman": return `${toRoman(n).toLowerCase()}.`;
    case "upper-roman": return `${toRoman(n)}.`;
    default: return `${n}.`;
  }
};

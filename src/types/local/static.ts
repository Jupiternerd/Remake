export enum BaseGrade {
    D,
    C,
    B,
    A,
    S,
    SS,
    SSS,
    X
}

export enum GradeEmoji {
    "🇩",
    "🇨",
    "🇧",
    "🇦",
    "🇸",
    "🇸🇸",
    "🇸🇸🇸",
    "🇽"
}

export enum GradeColor {
    "#d0f9ff",
    "#7fb9e7",
    "#40da90",
    "#ed5050",
    "#f4ac4a",
    "#ff4500",
    "#c13dff",
    "#000000"
}

export interface basic {
    _id: number | string,
    name: string,
    grade?: BaseGrade
    description?: string,
    emoji?: string
}

export enum AssetType {
    characters,
    backgrounds
}

export type AssetTypeStrings = keyof typeof AssetType;

type ArrayLengthMutationKeys = 'splice' | 'push' | 'pop' | 'shift' | 'unshift' | number
type ArrayItems<T extends Array<any>> = T extends Array<infer TItems> ? TItems : never
export type FixedLengthArray<T extends any[]> =
  Pick<T, Exclude<keyof T, ArrayLengthMutationKeys>>
  & { [Symbol.iterator]: () => IterableIterator< ArrayItems<T> > }
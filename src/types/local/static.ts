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
    _id: number,
    name?: string,
    grade?: BaseGrade
    emoji?: string
}

export enum AssetType {
    characters,
    backgrounds
}

export type AssetTypeStrings = keyof typeof AssetType;


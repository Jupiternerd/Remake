//imports

import { basic } from "../local/static";

// author = shokkunn

export interface Item extends basic {
    giftable?: boolean,
    description: string;
    //stackable: boolean;
}
//imports
import { MessageSelectMenuOptions } from "discord.js";
import { DisplayTypes, NovelSingle, SpecialTypes } from "../../types/models/stories";
import Singlet from "../singlet"
// author = shokkunn

/**
 * Name | Singles
 * Desc | Butchers the long multiples into single Singles.
 */
export default class NovelSingles extends Singlet implements NovelSingle {
    type: { display: DisplayTypes; special: { type: SpecialTypes; wait?: number; choices?: MessageSelectMenuOptions[]; }; };

}
//imports

import { AssetTypeStrings } from "../../types/local/static";

// author = shokkunn

export default class AssetManagement {

    /**
     * Name | convertToPhysicalLink
     * Desc | gets the type,
     * @param {AssetTypeStrings} type of the asset. eg. characters, backgrounds.
     * @param {string} link (link but actually just a name) of the file.
     * @param {boolean} blurred | if the file you requested should be blurred. Will navigate to correct dir to get the image.
     * @returns {string} of the physical link that we have on disk.
     */
    static async convertToPhysicalLink(type: AssetTypeStrings, link: string, blurred: boolean = false): Promise<string> {
        blurred = (type == "characters" && blurred == true ? false : blurred) // Since character images can't be blurred (why would you even want that) we default it to false.
        return `../assets/${type}/${blurred ? 'blurred' : 'normal'}/${link}` // returen the file location.
    }
}
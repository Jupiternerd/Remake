//imp

import { CharacterInteractions, CharacterSkins } from "../../types/models/characters";
import UniBase from "./base";

// author = shokkunn

export default class Character extends UniBase{
    skins: CharacterSkins;
    interactions: CharacterInteractions
    constructor(skins: CharacterSkins, interactions: CharacterInteractions) {
        super()
        this.skins = skins
        this.interactions = interactions

    }

}
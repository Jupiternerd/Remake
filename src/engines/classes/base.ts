//imp

import { MessageEmbed, MessageOptions } from "discord.js";
import { BaseGrade, basic } from "../../types/local/static";
import { EngineUtils } from "../../utilities/engineUtilities/utils";

// author = shokkunn

export default abstract class UniBase {
    _id: number | string;
    basic: basic;

    constructor(_id: number | string, basic?: basic) {
        this._id = _id;
        this.basic = basic;
        if (this.basic) this.basic.grade = (isNaN(this.basic.grade) ? EngineUtils.convertNumberToRarity(this.basic.grade) : this.basic.grade) as BaseGrade;
        //this.basic.description = (this.basic?.description ? this.basic.description : null);
    }

    /**
     * @name getInfoOutput
     * @returns a embeded info, should 
     */
    get getInfoOutput() {
        return new MessageEmbed(
            {
                title: `DB :: ${this.formattedOutputNoMarkUp}`,
                color: EngineUtils.convertGradeToColor(this.basic.grade),
                fields: [
                    {
                        name: "Basic Information",
                        value: `Description ::\n\`\`${this.basic?.description}\`\`\nGrade ::\n**${EngineUtils.convertNumberToRarity(this.basic.grade)}**`,
                        inline: true
                    }
                ]
            }
        )
    }

    /**
     * @returns a markedup version of the formatted name.
     */
    get formattedOutput() {
        const grade = (typeof this.basic.grade == "number" ? EngineUtils.convertNumberToRarity(this.basic.grade) : this.basic.grade);
        return `${this.basic.name} | Grade · ${grade}`;
    }

    /**
     * @returns a no markup version of the formatted name.
     */
    get formattedOutputNoMarkUp() {
        return this.formattedOutput.replace(/\*/g, "")
    }

}
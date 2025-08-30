import { createMasterPrompt } from "./createMaster";
import { callPerplexityAPI } from "./perplexityApi";

export interface LetterInput {
    from : {
        name : string,
        usn : string,
        email : string,
    },

    to : {
        name : string,
        email : string,
        info : string,
    },
    date : string,
    reason : string,
}

export interface GeneratedLetter {
    subject : string,
    body : string,
}

export async function generateProfessionalLetter(input : LetterInput) : Promise<GeneratedLetter> {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if(!apiKey){
        throw new Error("perplexity api key is missing");
    }

    try {
        const prompt = createMasterPrompt(input);

        const result = await callPerplexityAPI(prompt , apiKey);
        if(!result){
            throw new Error("Failed to generate the letter" , result);
        }
        console.log("Letter generated" , result);
        return {
            subject : result.subject,
            body : result.body,
        }
    } catch (error) {
        console.error("Letter generation failed" , error);
        return {
            subject : "Failed to generate the subject",
            body : "Failed to generate the body",
        }
    }
}
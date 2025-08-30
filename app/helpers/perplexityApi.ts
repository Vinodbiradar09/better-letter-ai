export interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface PerplexityReturnTyp {
    subject : string,
    body : string
}

export async function callPerplexityAPI(prompt : string , apiKey : string) : Promise<PerplexityReturnTyp> {
    const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

    const playload = {
        model : "sonar-pro",
        messages : [
            {
                role : "system",
                 content: 'You are Professor Elena Rosetti, world-renowned expert in academic communication with 45 years of experience at Oxford University. You craft the most sophisticated, intelligent, and uniquely articulated letters in academia. Every letter you write becomes a masterpiece of professional correspondence.'
            },
            {
                role : "user",
                content : prompt,
            }
        ],
        temperature : 0.95,
        max_tokens: 2500,
        top_p: 0.9,
        presence_penalty: 0.8,
        frequency_penalty: 0.9,
        stream: false
    }

    const response = await fetch(PERPLEXITY_API_URL , {
        method : "POST",
        headers : {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body : JSON.stringify(playload),
    })

    if(!response.ok){
        const errorText = await response.text();
        throw new Error(`API Error ${response.status} : ${errorText}`)
    }

    const data : PerplexityResponse = await response.json();
    if(!data.choices?.[0]?.message?.content){
        throw new Error('No response from Perplexity API For Letter generation');
    }
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
        throw new Error('Could not extract JSON from AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    if(!parsed.subject || !parsed.body){
        throw new Error('AI response missing for subject or body fields');
    }
    return {
        subject : parsed.subject,
        body : parsed.body,
    }
}
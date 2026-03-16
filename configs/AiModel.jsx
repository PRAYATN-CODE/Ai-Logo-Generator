import {
    GoogleGenerativeAI
} from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
};

export const AIDesignIdea = model.startChat({
    generationConfig,
    history: [
        {
            role: "user",
            parts: [
                { text: "Based on Logo of type Modern Mascot Logos Generate a text prompt to create Logo for Logo title/Brand name: Indian Spice with description: Indian Restaurant and referring to prompt: A vibrant logo featuring a friendly, animated character with a playful expression. The character is dressed in a classic uniform, complete with a distinctive accessory that adds personality. In one hand, they hold a signature item that represents the brand, while the other elements of the design-such as small decorative touches or natural accents-enhance the overall look. The background consists of a bold, circular design with subtle accents to highlight the character. Below, the brand name is displayed in bold, stylized lettering, with a slight curve and complementary decorative lines. The overall style is fun, welcoming, and full of character.. Give me 4/5 Suggestion of logo idea (each idea with maximum 4-5 words), Result in JSON format with ideas field\nlike that - {\n\"ideas\": [\n\"Chef Elephant with spices\",\n\"Smiling Mango character, Turban\",\n\"Friendly Tiger holding Curry\",\n\"Animated Nan bread chef\",\n\"Peacock waiter with plate\"\n1\n}" },
            ],
        },
        {
            role: "model",
            parts: [
                { text: "```json\n{\n\"ideas\": [\n\"Spice King Elephant Mascot\",\n\"Turbaned Chef Mango Mascot\",\n\"Curry Tiger Character Mascot\",\n\"Nan Bread Chef Mascot\",\n\"Peacock Waiter Spice Mascot\"\n]\n}\n```\n" },
            ],
        },
    ],
});


export const AILogoPrompt = model.startChat({
  generationConfig,
  history: [
    {
      role: "user",
      parts: [
        {
          text: `Generate a text prompt to create Logo for Logo Title/Brand name: Indian Restaurant, 
with description: Indian Restro, 
with Color combination of Ocean Blues and include Modern Sharp Lined Logos design idea.

Referring to this Logo Prompt:
Design a creative and artistic logo with a retro-modern vibe that showcases the brand's identity.

Give result in JSON format:

{
"prompt": "generated prompt here"
}`
        }
      ]
    }
  ]
});

// const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
// console.log(result.response.text());

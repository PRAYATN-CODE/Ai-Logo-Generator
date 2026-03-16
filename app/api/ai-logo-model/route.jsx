import { AILogoPrompt } from "@/configs/AiModel";
import cloudinary from "@/configs/cloudinaryConfig";
import { db } from "@/configs/FirebaseConfig";

import { InferenceClient } from "@huggingface/inference";
import { doc, setDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

const client = new InferenceClient(process.env.HUGGING_FACE_API_KEY);

export async function POST(req) {
    try {
        const { prompt, email, title, desc } = await req.json();

        if (!prompt) {
            return NextResponse.json(
                { error: "Missing prompt" },
                { status: 400 }
            );
        }

        /* -------------------------------
           1️⃣ REFINE PROMPT USING GEMINI
        --------------------------------*/

        const AiPromptResult = await AILogoPrompt.sendMessage(prompt);

        const rawText = AiPromptResult.response
            .text()
            .replace(/```json/g, "")
            .replace(/```/g, "");

        const parsedResult = JSON.parse(rawText);

        const finalPrompt = parsedResult?.prompt;

        if (!finalPrompt) {
            return NextResponse.json(
                { error: "Invalid AI prompt generated" },
                { status: 500 }
            );
        }

        /* -------------------------------
           2️⃣ GENERATE IMAGE USING HF FLUX
        --------------------------------*/

        const imageBlob = await client.textToImage({
            provider: "together",
            model: "black-forest-labs/FLUX.1-schnell",
            inputs: finalPrompt,
            parameters: {
                num_inference_steps: 5,
            },
        });

        if (!imageBlob) {
            return NextResponse.json(
                { error: "Image generation failed" },
                { status: 500 }
            );
        }

        /* -------------------------------
           3️⃣ CONVERT BLOB → BASE64
        --------------------------------*/

        const arrayBuffer = await imageBlob.arrayBuffer();

        const base64Image = Buffer.from(arrayBuffer).toString("base64");

        const base64WithMime = `data:image/png;base64,${base64Image}`;

        /* -------------------------------
           4️⃣ UPLOAD TO CLOUDINARY
        --------------------------------*/

        const uploadResult = await cloudinary.uploader.upload(base64WithMime, {
            folder: "logo-images",
        });

        /* -------------------------------
           5️⃣ SAVE TO FIRESTORE
        --------------------------------*/

        await setDoc(
            doc(db, "users", email, "logos", Date.now().toString()),
            {
                image: uploadResult.secure_url,
                title,
                desc,
                prompt: finalPrompt,
                createdAt: Date.now(),
            }
        );

        /* -------------------------------
           6️⃣ RETURN RESPONSE
        --------------------------------*/

        return NextResponse.json({
            image: uploadResult.secure_url,
        });

    } catch (error) {
        console.error(
            "API Error:",
            JSON.stringify(error, null, 2)
        );

        return NextResponse.json(
            {
                error: error.message || "Internal Server Error",
            },
            {
                status: error.status || 500,
            }
        );
    }
}
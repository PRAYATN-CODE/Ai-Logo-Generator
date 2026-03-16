"use client"

import { Button } from "@/components/ui/button"
import { SignInButton, useUser } from "@clerk/nextjs"
import axios from "axios"
import { ArrowLeft, ArrowRight, Loader2Icon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

// Keep your existing data imports
import Colors from "@/app/_data/Colors"
import LogoDesign from "@/app/_data/LogoDesign"
import Lookup from "@/app/_data/Lookup"
import Prompt from "@/app/_data/Prompt"

// --- Main Component ---
const CreateLogo = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()

  // State
  const [step, setStep] = useState(4)
  const [formData, setFormData] = useState({
    title: "shambho",
    desc: "shambho",
    palette: "Forest Greens",
    design: {
      image:"/design_7.png",
      prompt:"Design a creative and artistic logo with a retro-modern vibe that showcases the brand's identity. Use bold outlines, intricate patterns, and vibrant, contrasting colors to make the design pop. Incorporate thematic elements like food, nature, technology, or lifestyle symbols depending on the brand's niche. The typography should be playful yet clear, complementing the overall composition with a dynamic and balanced layout. Ensure the logo feels unique, versatile, and eye-catching",
      title:"Modern Sharp Lined Logos"
    },
    idea: null,
    pricing: null
  })
  const [aiIdeas, setAiIdeas] = useState(null)
  const [loading, setLoading] = useState(false)

  // 1️⃣ Sync Step with URL
  useEffect(() => {
    const currentStep = searchParams.get("step")
    if (currentStep) {
      setStep(Number(currentStep))
    } else {
      // Default to step 1 if no param exists
      router.replace("?step=1")
    }
  }, [searchParams])

  // 2️⃣ Load Data from Local Storage on Mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("formData")
      if (savedData) {
        setFormData(JSON.parse(savedData))
      }
    }
  }, [])

  // 3️⃣ Save Data to Local Storage on Change
  useEffect(() => {
    if (step > 1) { // Only save after step 1 to avoid overwriting with empty defaults immediately
      localStorage.setItem("formData", JSON.stringify(formData))
    }
  }, [formData])

  // 4️⃣ Handle AI Generation Trigger (Step 5)
  useEffect(() => {
    if (step === 5 && formData?.design && formData?.title && !aiIdeas) {
      generateLogoDesignIdea()
    }
  }, [step])

  // --- Handlers ---

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleStepChange = (direction) => {
    const newStep = direction === "next" ? step + 1 : step - 1
    setStep(newStep)
    router.push(`?step=${newStep}`)
  }

  const generateLogoDesignIdea = async () => {
    try {
      setLoading(true)
      const PROMPT = Prompt.DESIGN_IDEA_PROMPT
        .replace("{logoType}", formData.design.title)
        .replace("{logoTitle}", formData.title)
        .replace("{logoDesc}", formData.desc)
        .replace("{logoPrompt}", formData.design.prompt)

      const response = await axios.post("/api/ai-design-ideas", { prompt: PROMPT })

      if (response?.data?.ideas) {
        setAiIdeas(response.data.ideas)
      }
    } catch (error) {
      console.error("Error generating logo ideas:", error)
    } finally {
      setLoading(false)
    }
  }

  // --- Render Helpers (Sub-components Logic) ---

  const renderHeading = (title, desc) => (
    <div className="my-10">
      <h1 className="font-bold text-3xl text-primary">{title}</h1>
      <p className="text-lg text-gray-600 mt-2">{desc}</p>
    </div>
  )

  const renderStepContent = () => {
    switch (step) {
      // Step 1: Title
      case 1:
        return (
          <div>
            {renderHeading(Lookup.LogoTitle, Lookup.LogoTitleDesc)}
            <input
              type="text"
              placeholder={Lookup.InputTitlePlaceholder}
              className="p-4 border rounded-lg mt-5 w-full"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              autoFocus
            />
          </div>
        )

      // Step 2: Description
      case 2:
        return (
          <div>
            {renderHeading(Lookup.LogoDescTitle, Lookup.LogoDescDesc)}
            <input
              type="text"
              placeholder={Lookup.InputTitlePlaceholder}
              className="p-4 border rounded-lg mt-5 w-full"
              value={formData.desc}
              onChange={(e) => handleInputChange("desc", e.target.value)}
            />
          </div>
        )

      // Step 3: Color Palette
      case 3:
        return (
          <div>
            {renderHeading(Lookup.LogoColorPaletteTitle, Lookup.LogoColorPaletteDesc)}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mt-2">
              {Colors.map((palette, index) => (
                <div
                  key={index}
                  className={`flex p-1 cursor-pointer rounded-lg border-primary ${formData.palette === palette.name ? "border-2" : ""
                    }`}
                >
                  {palette.colors.map((color, idx) => (
                    <div
                      key={idx}
                      className="h-24 w-full"
                      style={{ backgroundColor: color }}
                      onClick={() => handleInputChange("palette", palette.name)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )

      // Step 4: Design Style
      case 4:
        return (
          <div>
            {renderHeading(Lookup.LogoDesignTitle, Lookup.LogoDesignDesc)}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mt-2">
              {LogoDesign.map((design, index) => (
                <div
                  key={index}
                  onClick={() => handleInputChange("design", design)}
                  className={`p-1 hover:border border-primary rounded-xl cursor-pointer ${formData.design?.title === design.title ? "border-2 rounded-xl border-primary" : ""
                    }`}
                >
                  <Image
                    src={design.image}
                    alt={design.title}
                    width={300}
                    height={150}
                    className="w-full rounded-lg h-[170px] object-cover"
                  />
                  <h1 className="text-center mt-2 font-bold text-gray-600">{design.title}</h1>
                </div>
              ))}
            </div>
          </div>
        )

      // Step 5: AI Ideas
      case 5:
        return (
          <div className="my-5">
            {renderHeading(Lookup.LogoIdeaTitle, Lookup.LogoIdeaDesc)}

            <div className="flex items-center justify-center">
              {loading && <Loader2Icon className="animate-spin my-10 w-8 h-8 text-primary" />}
            </div>

            {!loading && (
              <div className="flex flex-wrap gap-3 mt-2">
                {/* Generated Ideas */}
                {aiIdeas && aiIdeas.map((item, index) => (
                  <h2
                    key={index}
                    onClick={() => handleInputChange("idea", item)}
                    className={`p-2 rounded-full border px-3 cursor-pointer hover:border-primary ${formData.idea === item ? "border-primary bg-primary/10" : ""
                      }`}
                  >
                    {item}
                  </h2>
                ))}

                {/* Default AI Option */}
                <h2
                  onClick={() => handleInputChange("idea", "Let AI Select the best idea")}
                  className={`p-2 rounded-full border px-3 cursor-pointer hover:border-primary ${formData.idea === "Let AI Select the best idea" ? "border-primary bg-primary/10" : ""
                    }`}
                >
                  Let AI Select the best idea
                </h2>
              </div>
            )}
          </div>
        )

      // Step 6: Pricing / Finalize
      case 6:
        return (
          <div className="my-10">
            {renderHeading(Lookup.LogoPricingModelTitle, Lookup.LogoPricingModelDesc)}
            <div className="bg-white rounded-xl p-10 mt-4 border transition-all duration-300 text-center shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900">You're Almost There!</h2>
              <p className="mt-4 text-gray-600 text-lg mb-4">
                Hello! You're on the final step. Click the button below to generate your logo.
              </p>

              {user ? (
                <Link href={"/generate-logo"}>
                  <Button className="mt-auto py-3 text-lg w-full">Generate Logo</Button>
                </Link>
              ) : (
                <SignInButton mode="modal">
                  <Button className="mt-auto py-3 text-lg w-full">Generate Logo</Button>
                </SignInButton>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="mt-28 p-10 border rounded-xl 2xl:mx-72 shadow-sm bg-white">
      {/* Render Current Step */}
      {renderStepContent()}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-10 pt-5 border-t">
        {step > 1 && (
          <Button variant="outline" onClick={() => handleStepChange("prev")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        )}

        {/* Hide Continue button on last step (Pricing) */}
        {step < 6 && (
          <Button onClick={() => handleStepChange("next")} disabled={loading}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

// Wrap in Suspense because we use useSearchParams
export default function CreateLogoPage() {
  return (
    <Suspense fallback={<div className="flex justify-center mt-28"><Loader2Icon className="animate-spin" /></div>}>
      <CreateLogo />
    </Suspense>
  )
}
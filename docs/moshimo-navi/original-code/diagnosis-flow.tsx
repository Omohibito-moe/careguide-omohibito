"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

type CareType = "sudden" | "gradual"
type SuddenPhase = "acute" | "rehab" | "home" | "facility" | "no-hospital"
type GradualPhase = "pre-visit" | "pre-insurance" | "home-care"

interface DiagnosisFlowProps {
  onComplete: (result: { type: CareType; phase: SuddenPhase | GradualPhase }) => void
}

export default function DiagnosisFlow({ onComplete }: DiagnosisFlowProps) {
  const [step, setStep] = useState(1)
  const [careType, setCareType] = useState<CareType | null>(null)
  const [phase, setPhase] = useState<SuddenPhase | GradualPhase | null>(null)

  const handleCareTypeSelect = (type: CareType) => {
    setCareType(type)
    setStep(2)
  }

  const handlePhaseSelect = (selectedPhase: SuddenPhase | GradualPhase) => {
    setPhase(selectedPhase)
    if (careType) {
      onComplete({ type: careType, phase: selectedPhase })
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>まずは、介護が必要になった原因を教えてください。</CardTitle>
            <CardDescription>
              状況に最も近いものを選んでください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup className="space-y-4">
              <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem 
                  value="sudden" 
                  id="sudden"
                  onClick={() => handleCareTypeSelect("sudden")}
                />
                <div className="space-y-1">
                  <Label htmlFor="sudden" className="font-medium">
                    脳卒中・心筋梗塞・骨折/転倒など、「突然」症状が発症した
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    いきなり型の介護フローをご案内します
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem 
                  value="gradual" 
                  id="gradual"
                  onClick={() => handleCareTypeSelect("gradual")}
                />
                <div className="space-y-1">
                  <Label htmlFor="gradual" className="font-medium">
                    認知症、パーキンソン病、老化による衰えなど、「じわじわ」と症状が発症した
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    じわじわ型の介護フローをご案内します
                  </p>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {step === 2 && careType === "sudden" && (
        <Card>
          <CardHeader>
            <CardTitle>現在の状況は？</CardTitle>
            <CardDescription>
              現在の介護状況に最も近いものを選んでください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup className="space-y-4">
              <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem 
                  value="acute" 
                  id="acute"
                  onClick={() => handlePhaseSelect("acute")}
                />
                <Label htmlFor="acute" className="font-medium">
                  急性期病院に入院中
                </Label>
              </div>
              <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem 
                  value="rehab" 
                  id="rehab"
                  onClick={() => handlePhaseSelect("rehab")}
                />
                <Label htmlFor="rehab" className="font-medium">
                  リハビリ病院に入院中
                </Label>
              </div>
              <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem 
                  value="home" 
                  id="home"
                  onClick={() => handlePhaseSelect("home")}
                />
                <Label htmlFor="home" className="font-medium">
                  退院し、自宅で療養中
                </Label>
              </div>
              <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem 
                  value="facility" 
                  id="facility"
                  onClick={() => handlePhaseSelect("facility")}
                />
                <Label htmlFor="facility" className="font-medium">
                  退院し、施設で療養中
                </Label>
              </div>
              <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem 
                  value="no-hospital" 
                  id="no-hospital"
                  onClick={() => handlePhaseSelect("no-hospital")}
                />
                <Label htmlFor="no-hospital" className="font-medium">
                  最初から入院していない
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {step === 2 && careType === "gradual" && (
        <Card>
          <CardHeader>
            <CardTitle>現在の状況は？</CardTitle>
            <CardDescription>
              現在の介護状況に最も近いものを選んでください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup className="space-y-4">
              <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem 
                  value="pre-visit" 
                  id="pre-visit"
                  onClick={() => handlePhaseSelect("pre-visit")}
                />
                <Label htmlFor="pre-visit" className="font-medium">
                  異変を感じるが受診をしていない
                </Label>
              </div>
              <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem 
                  value="pre-insurance" 
                  id="pre-insurance"
                  onClick={() => handlePhaseSelect("pre-insurance")}
                />
                <Label htmlFor="pre-insurance" className="font-medium">
                  受診しているが介護保険申請をしていない
                </Label>
              </div>
              <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem 
                  value="home-care" 
                  id="home-care"
                  onClick={() => handlePhaseSelect("home-care")}
                />
                <Label htmlFor="home-care" className="font-medium">
                  介護保険を使用して在宅介護中である
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {step > 1 && (
        <Button 
          variant="outline" 
          onClick={() => {
            setStep(step - 1)
            if (step === 2) {
              setCareType(null)
              setPhase(null)
            }
          }}
          className="mt-4"
        >
          戻る
        </Button>
      )}
    </div>
  )
} 
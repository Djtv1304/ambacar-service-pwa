"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  number: number
  title: string
}

interface StepsIndicatorProps {
  steps: Step[]
  currentStep: number
}

export function StepsIndicator({ steps, currentStep }: StepsIndicatorProps) {
  return (
    <div className="w-full max-w-3xl mx-auto mb-6 sm:mb-8 px-2 sm:px-0">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number
          const isCurrent = currentStep === step.number
          const isLast = index === steps.length - 1

          return (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center min-w-[80px] sm:min-w-[100px] md:min-w-[120px]">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                    backgroundColor: isCompleted || isCurrent ? "#ED1C24" : "#e5e7eb",
                  }}
                  className={cn(
                    "w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-semibold transition-colors text-sm sm:text-base",
                    isCompleted || isCurrent ? "text-white" : "text-gray-500",
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : step.number}
                </motion.div>
                <p
                  className={cn(
                    "text-xs sm:text-sm mt-1 sm:mt-2 font-medium text-center whitespace-nowrap px-1",
                    isCurrent ? "text-[#ED1C24]" : "text-gray-600"
                  )}
                >
                  {step.title}
                </p>
              </div>

              {!isLast && (
                <div className="w-12 sm:w-16 md:w-24 h-0.5 mx-2 sm:mx-3 md:mx-4 bg-gray-200 relative overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{
                      width: isCompleted ? "100%" : "0%",
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-[#ED1C24]"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

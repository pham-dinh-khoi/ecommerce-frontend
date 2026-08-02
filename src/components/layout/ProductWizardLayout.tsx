import { Check } from "lucide-react";
import type { ReactNode } from "react";
import AdminLayout from "./AdminLayout";

interface ProductWizardLayoutProps {
  currentStep: 1 | 2 | 3;
  children: ReactNode;
}

const STEPS = [
  { number: 1, label: "Thông tin cơ bản" },
  { number: 2, label: "Biến thể" },
  { number: 3, label: "Hoàn tất" },
];

/**
 * StepIndicator
 * Displays an individual step in the wizard progress bar.
 */
function StepIndicator({
  step,
  currentStep,
  isLast,
}: {
  step: (typeof STEPS)[0];
  currentStep: number;
  isLast: boolean;
}) {
  const isCompleted = step.number < currentStep;
  const isActive = step.number === currentStep;

  // Determine styling based on status
  const circleClass = isCompleted
    ? "bg-[#0047AB] text-white"
    : isActive
    ? "border-2 border-[#0047AB] text-[#0047AB]"
    : "border-2 border-gray-200 text-gray-400";

  const labelClass =
    isActive || isCompleted ? "text-[#1A1A1A]" : "text-gray-400";

  const lineClass = isCompleted ? "bg-[#0047AB]" : "bg-gray-200";

  return (
    <div className="flex flex-1 items-center">
      <div className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${circleClass}`}
        >
          {isCompleted ? <Check size={16} /> : step.number}
        </div>
        <span className={`text-sm font-medium ${labelClass}`}>
          {step.label}
        </span>
      </div>
      {!isLast && <div className={`mx-4 h-0.5 flex-1 ${lineClass}`} />}
    </div>
  );
}

/**
 * ProductWizardLayout
 * Layout wrapper for the multi-step product creation flow.
 */
function ProductWizardLayout({ currentStep, children }: ProductWizardLayoutProps) {
  return (
    <AdminLayout>
      <h1 className="mb-6 text-xl font-bold text-[#1A1A1A]">
        Thêm sản phẩm mới
      </h1>

      {/* Progress Indicator */}
      <div className="mb-8 flex items-center">
        {STEPS.map((step, idx) => (
          <StepIndicator
            key={step.number}
            step={step}
            currentStep={currentStep}
            isLast={idx === STEPS.length - 1}
          />
        ))}
      </div>

      {/* Page Content */}
      {children}
    </AdminLayout>
  );
}

export default ProductWizardLayout;
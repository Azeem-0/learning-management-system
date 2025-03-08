"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function CommonForm({
  formControls,
  buttonText,
  formData,
  setFormData,
  isButtonDisabled,
  handleSubmit,
  buttonClassName,
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(e);
      }}
    >
      <div className="space-y-4">
        {formControls.map((controlItem, index) => (
          <div className="space-y-2" key={index}>
            <Label htmlFor={controlItem.id}>{controlItem.label}</Label>
            <Input
              id={controlItem.id}
              name={controlItem.name}
              type={controlItem.type}
              placeholder={controlItem.placeholder}
              value={formData?.[controlItem.name] || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [controlItem.name]: e.target.value,
                })
              }
              className="border-gray-300 focus:border-primary focus:ring-primary"
            />
          </div>
        ))}
        <Button
          type="submit"
          disabled={isButtonDisabled}
          className={cn("w-full mt-2", buttonClassName)}
        >
          {buttonText}
        </Button>
      </div>
    </form>
  );
}

export default CommonForm;

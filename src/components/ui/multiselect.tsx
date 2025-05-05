import * as React from "react";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

export interface Option {
  value: string;
  label: string;
}

interface MultiselectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  wrapperClassName?: string;
  errorMessage?: string;
  disabled?: boolean;
}

export function Multiselect({
  options,
  value,
  onChange,
  placeholder = "Wybierz...",
  className,
  wrapperClassName,
  errorMessage,
  disabled,
}: MultiselectProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (selectedValue: string) => {
    if (!value.includes(selectedValue)) {
      onChange([...value, selectedValue]);
    }
  };

  const handleRemove = (optionValue: string) => {
    onChange(value.filter((v) => v !== optionValue));
  };

  return (
    <div className={cn("relative w-full", wrapperClassName)}>
      <div
        className={cn(
          "border-input flex min-h-9 w-full flex-wrap items-center gap-2 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
          errorMessage && "border-destructive ring-destructive/20 dark:ring-destructive/40",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        {value.map((v) => {
          const option = options.find((opt) => opt.value === v);
          if (!option) return null;
          return (
            <Badge key={v} variant="secondary" className="gap-1 pr-1 hover:bg-secondary/80">
              {option.label}
              <button
                type="button"
                className="ml-1 rounded-full outline-none hover:bg-secondary/80 cursor-pointer"
                onClick={() => handleRemove(v)}
                disabled={disabled}
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          );
        })}
        <Select open={isOpen} onOpenChange={setIsOpen} value="" onValueChange={handleSelect} disabled={disabled}>
          <SelectTrigger className="h-auto min-w-[120px] border-0 bg-transparent p-0 shadow-none hover:bg-transparent focus-visible:ring-0">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options
              .filter((option) => !value.includes(option.value))
              .map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      {errorMessage && <p className="text-destructive text-sm mt-1">{errorMessage}</p>}
    </div>
  );
}

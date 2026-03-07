"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useLanguage } from "@/components/providers/rtl-provider";

interface ComboBoxProps {
    options: {label: string; value: string;}[];
    value?: string;
    onChange: (value: string) => void;
}

export const ComboBox = ({
    options,
    value,
    onChange,
}: ComboBoxProps) => {
  const { locale } = useLanguage();
  const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between"
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : tr("اختر الخيار...", "Select an option...")}
          <ChevronsUpDown className="rtl:mr-2 ltr:ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder={tr("ابحث عن خيار...", "Search option...")} />
          <CommandList>
            <CommandEmpty>{tr("لا يوجد خيارات.", "No options found.")}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange(option.value === value ? "" : option.value)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "rtl:mr-2 ltr:ml-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

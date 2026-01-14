"use client";

import ReactSelect, {
  components,
  GroupBase,
  StylesConfig,
  Props as ReactSelectProps,
} from "react-select";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options?: readonly SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  isDisabled?: boolean;
  disabled?: boolean; // Alias for isDisabled
}

export function CustomSelect({
  value,
  onValueChange,
  options,
  placeholder = "เลือก...",
  searchPlaceholder,
  emptyText = "ไม่พบข้อมูล",
  className,
  isDisabled,
  disabled,
}: CustomSelectProps) {
  const selectedOption = options?.find((opt) => opt.value === value) || null;
  const finalDisabled = isDisabled || disabled;

  const customStyles: StylesConfig<SelectOption, false> = {
    control: (base, state) => ({
      ...base,
      minHeight: "48px",
      height: "48px",
      backgroundColor: "rgba(255, 255, 255, 0.5)",
      backdropFilter: "blur(4px)",
      borderColor: state.isFocused
        ? "rgba(16, 185, 129, 0.5)"
        : "rgba(229, 231, 235, 0.5)",
      borderRadius: "0.75rem",
      borderWidth: "2px",
      boxShadow: state.isFocused
        ? "0 0 0 4px rgba(16, 185, 129, 0.1)"
        : "none",
      transition: "all 300ms",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        borderColor: "rgba(16, 185, 129, 0.5)",
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "0 12px",
      height: "48px",
    }),
    input: (base) => ({
      ...base,
      margin: "0",
      padding: "0",
      fontSize: "1rem",
      color: "#111827",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9CA3AF",
      fontSize: "1rem",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#111827",
      fontSize: "1rem",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(12px)",
      borderRadius: "0.75rem",
      border: "1px solid rgba(229, 231, 235, 0.5)",
      boxShadow:
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      overflow: "hidden",
      zIndex: 9999,
      marginTop: "4px",
    }),
    menuList: (base) => ({
      ...base,
      padding: "4px",
      maxHeight: "300px",
      overflowY: "auto",
      "::-webkit-scrollbar": {
        width: "8px",
      },
      "::-webkit-scrollbar-track": {
        background: "rgba(243, 244, 246, 0.5)",
        borderRadius: "4px",
      },
      "::-webkit-scrollbar-thumb": {
        background: "rgba(209, 213, 219, 0.8)",
        borderRadius: "4px",
      },
      "::-webkit-scrollbar-thumb:hover": {
        background: "rgba(156, 163, 175, 0.9)",
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "rgba(16, 185, 129, 0.1)"
        : state.isFocused
        ? "rgba(16, 185, 129, 0.05)"
        : "transparent",
      color: state.isSelected ? "#065F46" : "#111827",
      cursor: "pointer",
      padding: "12px 16px",
      fontSize: "0.875rem",
      borderRadius: "0.5rem",
      margin: "2px 0",
      fontWeight: state.isSelected ? "600" : "400",
      transition: "all 150ms",
      "&:active": {
        backgroundColor: "rgba(16, 185, 129, 0.15)",
      },
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: "#6B7280",
      padding: "0 12px",
      transition: "all 200ms",
      transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "rotate(0)",
      "&:hover": {
        color: "#10B981",
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "#6B7280",
      padding: "0 8px",
      cursor: "pointer",
      "&:hover": {
        color: "#EF4444",
      },
    }),
    noOptionsMessage: (base) => ({
      ...base,
      fontSize: "0.875rem",
      color: "#6B7280",
      padding: "12px",
    }),
  };

  const DropdownIndicator = (props: any) => {
    return (
      <components.DropdownIndicator {...props}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </components.DropdownIndicator>
    );
  };

  return (
    <ReactSelect<SelectOption, false>
      className={cn("react-select-container", className)}
      classNamePrefix="react-select"
      value={selectedOption}
      onChange={(option) => {
        if (option && onValueChange) {
          onValueChange(option.value);
        }
      }}
      options={options as SelectOption[]}
      styles={customStyles}
      components={{ DropdownIndicator }}
      placeholder={placeholder}
      noOptionsMessage={() => emptyText}
      isDisabled={finalDisabled}
      isClearable={false}
      isSearchable={true}
      menuPlacement="auto"
      menuPosition="fixed"
      filterOption={(option, inputValue) => {
        const label = option.label.toLowerCase();
        const value = option.value.toLowerCase();
        const search = inputValue.toLowerCase();
        return label.includes(search) || value.includes(search);
      }}
    />
  );
}

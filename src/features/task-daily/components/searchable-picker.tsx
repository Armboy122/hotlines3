"use client";

import { useState, useMemo, useCallback, memo } from "react";
import { Popup, SearchBar, List } from "antd-mobile";
import { Check, ChevronDown, X } from "lucide-react";
import type { SearchablePickerProps } from "../types";

/**
 * Picker component พร้อมช่องค้นหา
 * เหมาะสำหรับ list ที่มีตัวเลือกจำนวนมาก
 */
function SearchablePickerComponent({
  id,
  value,
  onChange,
  options,
  placeholder = "เลือก...",
  title = "เลือกรายการ",
  disabled = false,
}: SearchablePickerProps) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");

  // หา label ของ option ที่ถูกเลือก
  const selectedLabel = useMemo(() => {
    return options.find((opt) => opt.value === value)?.label || "";
  }, [options, value]);

  // Filter options ตามคำค้นหา
  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const query = search.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        opt.value.toLowerCase().includes(query)
    );
  }, [options, search]);

  // Handlers
  const handleOpen = useCallback(() => {
    if (!disabled) setVisible(true);
  }, [disabled]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setSearch("");
  }, []);

  const handleSelect = useCallback(
    (val: string) => {
      onChange?.(val);
      handleClose();
    },
    [onChange, handleClose]
  );

  return (
    <>
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={`
          smart-home-control smart-home-focus flex h-12 w-full items-center justify-between px-4
          text-left text-base font-medium
          ${disabled ? "opacity-50 cursor-not-allowed bg-gray-100/50" : "hover:border-blue-400/80 hover:bg-white/90 active:scale-[0.98] cursor-pointer"}
          ${!selectedLabel ? "text-gray-400" : "text-gray-900"}
        `}
      >
        <span className="truncate">{selectedLabel || placeholder}</span>
        <div className={`transition-transform duration-300 ${visible ? 'rotate-180 text-blue-500' : 'text-gray-400'}`}>
          <ChevronDownIcon />
        </div>
      </button>

      {/* Bottom Sheet Popup */}
      <Popup
        visible={visible}
        onMaskClick={handleClose}
        position="bottom"
        bodyStyle={{
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
          minHeight: "50vh",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(18px)",
        }}
      >
        {/* Handle Bar */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 bg-gray-200/80 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={handleClose}
            className="smart-home-control flex h-10 w-10 items-center justify-center text-gray-400 hover:text-gray-600 active:scale-95"
            aria-label="ปิด"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <SearchBar
            placeholder="พิมพ์เพื่อค้นหา..."
            value={search}
            onChange={setSearch}
            style={{ "--border-radius": "12px", "--height": "44px" }}
          />
        </div>

        <div className="border-t border-sky-100/80" />

        {/* Options List */}
        <div className="flex-1 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <EmptyState />
          ) : (
            <List>
              {filteredOptions.map((opt) => (
                <OptionItem
                  key={opt.value}
                  label={opt.label}
                  isSelected={opt.value === value}
                  onSelect={() => handleSelect(opt.value)}
                />
              ))}
            </List>
          )}
        </div>

        {/* Safe Area */}
        <div className="h-8 bg-white shrink-0" />
      </Popup>
    </>
  );
}

// ========== Sub Components ==========

const OptionItem = memo(function OptionItem({
  label,
  isSelected,
  onSelect,
}: {
  label: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <List.Item
      onClick={onSelect}
      arrow={false}
      clickable
      style={{ padding: '0 12px' }}
    >
      <div className={`
        flex items-center justify-between rounded-xl p-3 transition-all duration-200
        ${isSelected ? "border border-blue-100/70 bg-blue-50/80 shadow-sm" : "border border-transparent hover:bg-sky-50/70"}
      `}>
        <span className={isSelected ? "text-blue-800 font-bold" : "text-gray-700 font-medium text-[0.95rem]"}>
          {label}
        </span>
        {isSelected && (
          <div className="flex h-6 w-6 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/30">
            <Check className="h-4 w-4" aria-hidden="true" />
          </div>
        )}
      </div>
    </List.Item>
  );
});

function EmptyState() {
  return (
    <div className="py-12 text-center text-gray-500">
      ไม่พบข้อมูล
    </div>
  );
}

// ========== Icons ==========

function ChevronDownIcon() {
  return (
    <ChevronDown className="h-5 w-5 shrink-0 text-gray-400" aria-hidden="true" />
  );
}

function CloseIcon() {
  return (
    <X className="h-5 w-5" aria-hidden="true" />
  );
}

export const SearchablePicker = memo(SearchablePickerComponent);

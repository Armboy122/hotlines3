"use client";

import { useState, useMemo, useCallback, memo } from "react";
import { Popup, SearchBar, List } from "antd-mobile";
import { CheckOutline } from "antd-mobile-icons";
import type { SearchablePickerProps } from "../types";

/**
 * Picker component พร้อมช่องค้นหา
 * เหมาะสำหรับ list ที่มีตัวเลือกจำนวนมาก
 */
function SearchablePickerComponent({
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
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={`
          w-full h-14 px-5 flex items-center justify-between
          bg-white/60 backdrop-blur-md border border-gray-200/80 rounded-2xl
          text-left text-[0.95rem] font-medium shadow-sm transition-all duration-300
          ${disabled ? "opacity-50 cursor-not-allowed bg-gray-100/50" : "hover:border-emerald-400/80 hover:shadow-md hover:bg-white/90 active:scale-[0.98] cursor-pointer"}
          ${!selectedLabel ? "text-gray-400" : "text-gray-900"}
        `}
      >
        <span className="truncate">{selectedLabel || placeholder}</span>
        <div className={`transition-transform duration-300 ${visible ? 'rotate-180 text-emerald-500' : 'text-gray-400'}`}>
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
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full transition-all active:scale-95"
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

        <div className="border-t border-gray-100" />

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
        flex items-center justify-between p-3 rounded-2xl transition-all duration-200
        ${isSelected ? "bg-emerald-50 shadow-sm border border-emerald-100/50" : "hover:bg-gray-50 border border-transparent"}
      `}>
        <span className={isSelected ? "text-emerald-800 font-bold" : "text-gray-700 font-medium text-[0.95rem]"}>
          {label}
        </span>
        {isSelected && (
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
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
    <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export const SearchablePicker = memo(SearchablePickerComponent);

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
          w-full h-12 px-4 flex items-center justify-between
          bg-white/70 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl
          text-left text-base transition-all
          ${disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : "hover:border-emerald-400 focus:border-emerald-500"}
          ${!selectedLabel ? "text-gray-400" : "text-gray-900"}
        `}
      >
        <span className="truncate">{selectedLabel || placeholder}</span>
        <ChevronDownIcon />
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
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
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
      extra={isSelected ? <CheckOutline className="text-emerald-500" style={{ fontSize: 20 }} /> : null}
      style={{ backgroundColor: isSelected ? "#ecfdf5" : undefined }}
    >
      <span className={isSelected ? "text-emerald-700 font-semibold" : "text-gray-900"}>
        {label}
      </span>
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

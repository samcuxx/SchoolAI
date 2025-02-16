"use client";

import { useState } from "react";
import type { PDFOptions } from "@/types";

const AVAILABLE_FONTS = ["Times-Roman", "Helvetica", "Courier"] as const;

interface PDFSettingsProps {
  onSettingsChange: (settings: PDFOptions) => void;
  initialSettings?: PDFOptions;
}

const DEFAULT_SETTINGS: PDFOptions = {
  includeSchoolDetails: true,
  fontSize: 12,
  fontFamily: "Times-Roman",
  lineHeight: 1.5,
};

export default function PDFSettings({
  onSettingsChange,
  initialSettings = DEFAULT_SETTINGS,
}: PDFSettingsProps) {
  const [settings, setSettings] = useState<PDFOptions>(initialSettings);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let newValue: any = value;

    if (type === "number") {
      newValue = parseFloat(value);
    } else if (type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked;
    }

    const updatedSettings = {
      ...settings,
      [name]: newValue,
    };

    setSettings(updatedSettings);
    onSettingsChange(updatedSettings);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          PDF Export Settings
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Customize how your PDF will look
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex items-center">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="includeSchoolDetails"
              checked={settings.includeSchoolDetails}
              onChange={handleChange}
              className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
              aria-label="Include school details in PDF"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Include School Details
            </span>
          </label>
        </div>

        <div>
          <label
            htmlFor="fontFamily"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Font Family
          </label>
          <select
            id="fontFamily"
            name="fontFamily"
            value={settings.fontFamily}
            onChange={handleChange}
            className="input-primary mt-1"
            aria-label="Select font family for PDF"
          >
            {AVAILABLE_FONTS.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="fontSize"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Font Size
          </label>
          <input
            type="number"
            name="fontSize"
            id="fontSize"
            min="8"
            max="24"
            value={settings.fontSize}
            onChange={handleChange}
            className="input-primary mt-1"
            aria-label="Font size in points"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Size in points (8-24)
          </p>
        </div>

        <div>
          <label
            htmlFor="lineHeight"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Line Height
          </label>
          <input
            type="number"
            name="lineHeight"
            id="lineHeight"
            min="1"
            max="3"
            step="0.1"
            value={settings.lineHeight}
            onChange={handleChange}
            className="input-primary mt-1"
            aria-label="Line height multiplier"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Line spacing multiplier (1.0-3.0)
          </p>
        </div>
      </div>
    </div>
  );
}

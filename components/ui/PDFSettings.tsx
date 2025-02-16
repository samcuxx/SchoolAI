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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
          PDF Export Settings
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Customize how your PDF will look
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="includeSchoolDetails"
              checked={settings.includeSchoolDetails}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">
              Include School Details
            </span>
          </label>
        </div>

        <div>
          <label
            htmlFor="fontFamily"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Font Family
          </label>
          <select
            id="fontFamily"
            name="fontFamily"
            value={settings.fontFamily}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
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
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
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
            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label
            htmlFor="lineHeight"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
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
            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
}

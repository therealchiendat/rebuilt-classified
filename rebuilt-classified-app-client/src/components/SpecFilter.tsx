import React, { useState } from "react";
import "./SpecFilter.css";
interface SpecFilterProps {
    items: Array<{
        specifications: Array<{
            key: string;
            value: string;
        }>;
    }>;
    specFilters: Record<string, Array<string>>;
    setSpecFilters: React.Dispatch<React.SetStateAction<Record<string, Array<string>>>>;
}

export default function SpecFilter({ items, specFilters, setSpecFilters }: SpecFilterProps) {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    // Collect available specification values for each key
    let specValues: Record<string, Array<string>> = {};
    const motorKeys: Record<string, Array<string>> = {};
    items.forEach((item) => {
        item.specifications?.forEach((spec) => {
            if (!(spec.key in specValues)) {
                specValues[spec.key] = [];
            }
            if (!specValues[spec.key].includes(spec.value)) {
                specValues[spec.key].push(spec.value);
            }
        });
    });

    // Separate motor keys from other keys
    Object.entries(specValues).forEach(([key, values]) => {
        if (key.toLowerCase().includes('motor')) {
            motorKeys[key] = values;
            delete specValues[key];
        }
    });

    // Combine motor keys and other keys such that motor keys appear first
    specValues = { ...motorKeys, ...specValues };

    // Handle filter selection
    function handleFilterSelect(key: string, value: string) {
        setSpecFilters((prevFilters) => {
            const newFilters = { ...prevFilters };
            if (!(key in newFilters)) {
                newFilters[key] = [];
            }
            if (newFilters[key].includes(value)) {
                newFilters[key] = newFilters[key].filter((v) => v !== value);
            } else {
                newFilters[key] = [...newFilters[key], value];
            }
            return newFilters;
        });
    }

    return (
        <div className="spec-filter">
            {Object.entries(specValues).map(([key, values]) => (
                <div
                    className="dropdown"
                    key={key}
                    onMouseLeave={() => setActiveDropdown(null)}
                >
                    <button
                        className={"dropbtn" + ((activeDropdown === key) ? " focus" :  (specFilters[key]?.length > 0) ? " active" : "" )}
                        onClick={() =>
                            activeDropdown === key
                                ? setActiveDropdown(null)
                                : setActiveDropdown(key)
                        }
                    >
                        {key}{specFilters[key]?.length > 0 ? ":" : ""} {specFilters[key]?.join(', ')}
                    </button>
                    {activeDropdown === key && (
                        <div className="dropdown-content">
                            {values.map((value) => (
                                <label key={value}>
                                    <input
                                        type="checkbox"
                                        value={value}
                                        checked={specFilters[key]?.includes(value)}
                                        onChange={() => handleFilterSelect(key, value)}
                                    />
                                    {value}
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

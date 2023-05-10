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
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    // Collect available specification values for each key
    const specValues: Record<string, Array<string>> = {};
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
            <button className="toggle" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                Filter by Specifications
            </button>
            {isFilterOpen && (
                <table className="filter-table">
                    <thead>
                    <tr>
                        <th>Key</th>
                        <th>Values</th>
                    </tr>
                    </thead>
                    <tbody>
                    {Object.entries(specValues).map(([key, values]) => (
                        <tr className="filter-row" key={key}>
                            <td className="filter-key">{key}</td>
                            <td className="filter-values">
                                {values.map((value) => (
                                    <label key={value}>
                                        <input
                                            type="checkbox"
                                            value={value}
                                            checked={specFilters[key]?.includes(value)}
                                            onChange={() => handleFilterSelect(key, value)}
                                        />
                                        <div>{value}</div>
                                    </label>
                                ))}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/components/san-pham/priceRange.module.scss";

interface PriceRangeProps {
    min?: number;
    max?: number;
    step?: number;
    onChange?: (values: [number, number]) => void;
}

export default function PriceRange({
    min = 0,
    max = 1000,
    step = 1,
    onChange,
}: PriceRangeProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [minValue, setMinValue] = useState(min);
    const [maxValue, setMaxValue] = useState(max);

    const trackStyle = useMemo(() => {
        if (minValue === min && maxValue === max) return { background: "#000" };
        const minPercent = ((minValue - min) / (max - min)) * 100;
        const maxPercent = ((maxValue - min) / (max - min)) * 100;
        return {
            background: `linear-gradient(to right, #dadada ${minPercent}%, #000 ${minPercent}%, #000 ${maxPercent}%, #dadada ${maxPercent}%)`,
        };
    }, [minValue, maxValue, min, max]);

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.min(Number(e.target.value), maxValue - step);
        setMinValue(value);
    };
    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(Number(e.target.value), minValue + step);
        setMaxValue(value);
    };
    const handleCommit = () => onChange?.([minValue, maxValue]);

    const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = clickX / rect.width;
        const clickValue = min + percent * (max - min);

        const midValue = (minValue + maxValue) / 2;

        if (clickValue < midValue) {

            const newMin = Math.min(midValue - (max - min) * 0.02, clickValue);
            setMinValue(Math.max(min, Math.round(newMin / step) * step));
            onChange?.([Math.max(min, Math.round(newMin / step) * step), maxValue]);
        } else {
            const newMax = Math.max(midValue + (max - min) * 0.02, clickValue);
            setMaxValue(Math.min(max, Math.round(newMax / step) * step));
            onChange?.([minValue, Math.min(max, Math.round(newMax / step) * step)]);
        }
    };

    useEffect(() => {
        const handleInitFilter = (e: CustomEvent<{ priceMin: number; priceMax: number }>) => {
            if (e.detail.priceMin || e.detail.priceMax) {
                setMinValue(e.detail.priceMin);
                setMaxValue(e.detail.priceMax);
            }
        };
        window.addEventListener("initFilter", handleInitFilter as EventListener);
        return () => window.removeEventListener("initFilter", handleInitFilter as EventListener);
    }, []);

    return (
        <div className={styles.priceRange}>
            <h3 className={styles.heading}>GIÁ</h3>

            <div className={styles.sliderWrapper}>
                <div
                    ref={trackRef}
                    className={styles.sliderTrack}
                    style={trackStyle}
                    onClick={handleTrackClick}
                ></div>

                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={minValue}
                    onChange={handleMinChange}
                    onMouseUp={handleCommit}
                    onTouchEnd={handleCommit}
                    className={`${styles.thumb} ${styles.thumbLeft}`}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={maxValue}
                    onChange={handleMaxChange}
                    onMouseUp={handleCommit}
                    onTouchEnd={handleCommit}
                    className={`${styles.thumb} ${styles.thumbRight}`}
                />
            </div>

            <p className={styles.priceText}>
                Price: <span>${minValue}</span> - <span>${maxValue}</span>
            </p>
        </div>
    );
}

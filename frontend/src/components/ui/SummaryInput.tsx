import React, { useEffect, useRef } from 'react';

interface SummaryInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onValueChange: (val: string) => void;
}

export default function SummaryInput({ onValueChange, ...props }: SummaryInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.stopPropagation();
            }
        };
        const el = inputRef.current;
        if (el) {
            el.addEventListener('keydown', handleKeyDown);
            el.addEventListener('keyup', handleKeyDown);
            el.addEventListener('keypress', handleKeyDown);
        }
        return () => {
            if (el) {
                el.removeEventListener('keydown', handleKeyDown);
                el.removeEventListener('keyup', handleKeyDown);
                el.removeEventListener('keypress', handleKeyDown);
            }
        };
    }, []);

    return (
        <input
            {...props}
            ref={inputRef}
            onChange={(e) => onValueChange(e.target.value)}
        />
    );
}

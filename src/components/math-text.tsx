'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';

interface MathTextProps {
    text: string | undefined | null;
    isBlock?: boolean;
}

const MathText: React.FC<MathTextProps> = ({ text, isBlock = false }) => {
    // 1. Robust check: Ensure text is a non-empty string.
    if (typeof text !== 'string' || !text) {
        return null;
    }

    // 2. Safely format the text for KaTeX.
    const formattedText = text.replace(/\\n/g, '\\\\');

    // 3. Render with error boundary. If KaTeX fails, render plain text.
    try {
        if (isBlock) {
            return <BlockMath math={formattedText} />;
        }
        return <InlineMath math={formattedText} />;
    } catch (error) {
        console.error("KaTeX parsing error:", error);
        // Fallback to rendering the original text if KaTeX fails
        return <span>{text}</span>;
    }
};

export default MathText;

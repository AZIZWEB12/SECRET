'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';

interface MathTextProps {
    text: string;
    isBlock?: boolean;
}

const MathText: React.FC<MathTextProps> = ({ text, isBlock = false }) => {
    if (!text) {
        return null;
    }

    // Replace single backslashes for newlines with double backslashes for KaTeX
    const formattedText = text.replace(/\\n/g, '\\\\');

    try {
        if (isBlock) {
            return <BlockMath math={formattedText} />;
        }
        return <InlineMath math={formattedText} />;
    } catch (error) {
        // If KaTeX parsing fails, render the original text.
        // This prevents the app from crashing on invalid LaTeX syntax.
        return <span>{text}</span>;
    }
};

export default MathText;

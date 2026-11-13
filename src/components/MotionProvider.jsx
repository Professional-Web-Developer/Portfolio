'use client';
import { MotionConfig } from 'framer-motion';

// Honours the OS "reduce motion" setting for every framer-motion animation.
export default function MotionProvider({ children }) {
    return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

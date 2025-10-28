import { useState, useRef } from "react";

export const useUploadProgress = () => {
    const [uploadDProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [contentLength, setContentLength] = useState(0);
    const animationRef = useRef(null);
    const lastUpdateRef = useRef(0);

    const simulateProgress = (duration) => {
        const startTime = Date.now();
        const updateProgress = () => {
            const progress = Math.min(
                ((Date.now() - startTime) / duration) * 100,
                90
            );
            setUploadProgress(Math.round(progress));
            if (progress < 90) {
                animationRef.current = requestAnimationFrame(updateProgress);
            }
        };
        animationRef.current = requestAnimationFrame(updateProgress);
    };

    const trackUploadProgress = (progressEvent) => {
        if (progressEvent.lengthComputable) {
            const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
        }
    };

    const startUpload = (length) => {
        setIsUploading(true);
        setUploadProgress(0);
        setContentLength(length);
        simulateProgress(length > 20000 ? 5000 : 3000);
    };

    const endUpload = () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        setUploadProgress(100);
        setTimeout(() => setIsUploading(false), 2000); // Keep "Finalizing" for 2 seconds
    };

    const resetUpload = () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        setUploadProgress(0);
        setIsUploading(false);
    };

    return {
        uploadDProgress,
        isUploading,
        startUpload,
        endUpload,
        trackUploadProgress,
        resetUpload,
        contentLength
    };
};
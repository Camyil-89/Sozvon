
import { useState } from 'react';
export const Avatar = ({ src, fallback, className = '' }) => {
    const [imgError, setImgError] = useState(false);

    return (
        <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>
            {src && !imgError ? (
                <img
                    src={src}
                    alt="Avatar"
                    className="aspect-square h-full w-full"
                    onError={() => setImgError(true)}
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100">
                    {fallback ? (
                        <span className="text-sm font-medium text-gray-600">
                            {typeof fallback === 'string' ? fallback.charAt(0).toUpperCase() : fallback}
                        </span>
                    ) : null}
                </div>
            )}
        </div>
    );
};
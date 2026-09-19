import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { getProductThumbnailUrl, normalizeImageUrl } from '../../utils/imageUtils';

interface ProductThumbnailProps {
  product?: any;
  src?: string;
  alt?: string;
  isDark?: boolean;
  className?: string;
  iconSize?: number;
  showIndicator?: boolean;
}

export const ProductThumbnail: React.FC<ProductThumbnailProps> = ({
  product,
  src,
  alt = '',
  isDark = true,
  className = 'w-11 h-11',
  iconSize = 18,
  showIndicator = false
}) => {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = getProductThumbnailUrl(product) || normalizeImageUrl(src) || '';

  useEffect(() => {
    setHasError(false);
  }, [resolvedSrc]);

  const hasValidImage = !!resolvedSrc && !hasError;

  return (
    <div
      className={`relative shrink-0 ${className} rounded-[3px] overflow-hidden border flex items-center justify-center transition-colors ${
        isDark ? 'bg-[#121212] border-[#E2DCC8]/15' : 'bg-slate-100 border-slate-200'
      }`}
    >
      {hasValidImage ? (
        <img
          src={resolvedSrc}
          alt={alt}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <Package
          size={iconSize}
          className={`${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-400'}`}
        />
      )}

      {showIndicator && hasValidImage && (
        <div
          className={`absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border rounded-full ${
            isDark ? 'border-[#121212]' : 'border-white'
          }`}
        />
      )}
    </div>
  );
};

export default ProductThumbnail;

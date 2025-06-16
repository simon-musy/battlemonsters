import { useState, useRef, useCallback } from 'react';
import { imageCache, generateImageCacheKey } from '../utils/apiCache';
import { performanceMonitor } from '../utils/performanceMonitor';

interface ImageGenerationState {
  isGenerating: boolean;
  error: boolean;
  imageUrl?: string;
  aspectRatio?: string;
}

interface ImageGenerationOptions {
  prompt: string;
  aspectRatio?: string;
  cacheKey?: string;
}

export function useImageGeneration() {
  const [state, setState] = useState<ImageGenerationState>({
    isGenerating: false,
    error: false,
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentRequestRef = useRef<string | null>(null);

  const generateImage = useCallback(async (options: ImageGenerationOptions) => {
    const { prompt, aspectRatio, cacheKey } = options;
    const requestKey = cacheKey || generateImageCacheKey(prompt, aspectRatio);
    
    // Cancel any existing request for this hook instance
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    currentRequestRef.current = requestKey;

    setState(prev => ({ ...prev, isGenerating: true, error: false }));

    try {
      const result = await imageCache.get(
        requestKey,
        async () => {
          // Log API call for performance monitoring
          performanceMonitor.logAPICall('character-image', requestKey);

          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/character-image`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                prompt,
                ...(aspectRatio && { aspect_ratio: aspectRatio })
              }),
              signal: abortControllerRef.current?.signal,
            }
          );

          if (!response.ok) {
            throw new Error('Failed to generate image');
          }

          const data = await response.json();
          
          if (!data.url) {
            throw new Error('No image URL returned');
          }

          return {
            url: data.url,
            aspectRatio: data.aspect_ratio,
          };
        }
      );

      // Only update state if this is still the current request
      if (currentRequestRef.current === requestKey) {
        setState({
          isGenerating: false,
          error: false,
          imageUrl: result.url,
          aspectRatio: result.aspectRatio,
        });
      } else {
        // Log cache hit for performance monitoring
        performanceMonitor.logCacheHit(requestKey);
      }

      return result;
    } catch (error) {
      // Only update state if this is still the current request and not aborted
      if (currentRequestRef.current === requestKey && error.name !== 'AbortError') {
        setState(prev => ({ ...prev, isGenerating: false, error: true }));
      }
      
      if (error.name !== 'AbortError') {
        console.error('Failed to generate image:', error);
      }
      throw error;
    }
  }, []);

  const retry = useCallback((options: ImageGenerationOptions) => {
    const requestKey = options.cacheKey || generateImageCacheKey(options.prompt, options.aspectRatio);
    
    // Clear cached results for this key to force regeneration
    imageCache.invalidate(requestKey);
    
    return generateImage(options);
  }, [generateImage]);

  const clearCache = useCallback(() => {
    imageCache.clear();
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    ...state,
    generateImage,
    retry,
    clearCache,
    cleanup,
  };
}
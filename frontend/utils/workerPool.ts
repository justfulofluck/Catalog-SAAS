class WorkerPool {
  private worker: Worker | null = null;
  private pendingRequests: Map<string, { resolve: (val: any) => void; reject: (err: any) => void }> = new Map();

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
      try {
        this.worker = new Worker(new URL('../workers/imageProcessor.worker.ts', import.meta.url), {
          type: 'module'
        });

        this.worker.onmessage = (e: MessageEvent) => {
          const { id, success, processedUrl, width, height, error } = e.data;
          const callbacks = this.pendingRequests.get(id);
          if (callbacks) {
            if (success) {
              callbacks.resolve({ processedUrl, width, height });
            } else {
              callbacks.reject(new Error(error || 'Worker processing failed'));
            }
            this.pendingRequests.delete(id);
          }
        };

        this.worker.onerror = (err) => {
          console.warn('Image worker encountered an error:', err);
        };
      } catch (err) {
        console.warn('Worker initialization not supported or failed, falling back to main thread.', err);
      }
    }
  }

  public async processImage(
    imageUrl: string,
    filters?: { brightness?: number; contrast?: number; saturation?: number; grayscale?: boolean; blur?: number },
    targetWidth?: number,
    targetHeight?: number
  ): Promise<{ processedUrl: string; width: number; height: number }> {
    if (!this.worker) {
      return { processedUrl: imageUrl, width: targetWidth || 0, height: targetHeight || 0 };
    }

    const id = 'req_' + Math.random().toString(36).substr(2, 9);
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.worker!.postMessage({
        id,
        type: 'PROCESS_IMAGE',
        imageUrl,
        filters,
        targetWidth,
        targetHeight
      });
    });
  }
}

export const workerPool = new WorkerPool();

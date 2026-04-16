const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const retryWithBackoff = async (fn, maxAttempts = 3, delays = [0, 5000, 25000]) => {
  for (let i = 0; i < maxAttempts; i += 1) {
    const delayMs = delays[i] ?? 0;
    if (delayMs > 0) {
      await sleep(delayMs);
    }

    const result = await fn(i + 1);
    if (result?.success) {
      return result;
    }
  }

  return { success: false, error: 'Max retries exceeded' };
};

/**
 * fetcher 确保只加载一次
 */
enum FetcherStatus {
  initial = 'initial',
  pending = 'pending',
  fulfilled = 'fulfilled',
  rejected = 'rejected',
}

export type Fetcher<TResult> = () => TResult;

function createFetcher<T>(promise: () => Promise<T>): Fetcher<T> {
  let status = FetcherStatus.initial;
  let task: ReturnType<typeof promise> | null = null;
  let result: T;
  function fetcher() {
    if (status === FetcherStatus.pending) {
      return result;
    }
    if (status === FetcherStatus.fulfilled) {
      return result;
    }
    if (status === FetcherStatus.rejected) {
      throw result;
    }

    if (task) {
      throw task;
    }

    task = promise();
    status = FetcherStatus.pending;
    task
      .then(res => {
        status = FetcherStatus.fulfilled;
        result = res;
      })
      .catch(err => {
        status = FetcherStatus.rejected;
        result = err;
      });
    throw task;
  }

  return fetcher;
}

export default createFetcher;

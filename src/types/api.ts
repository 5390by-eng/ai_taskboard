export type ServiceResult<T> = {
  data: T;
  error: null;
} | {
  data: null;
  error: string;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export function success<T>(data: T): ServiceResult<T> {
  return { data, error: null };
}

export function failure<T>(error: string): ServiceResult<T> {
  return { data: null, error };
}

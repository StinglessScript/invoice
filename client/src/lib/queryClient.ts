import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Phát hiện nếu dữ liệu có chứa hình ảnh base64 (có thể là QR code hoặc ảnh lớn)
  const containsLargeData = data && 
    typeof data === 'object' && 
    Object.values(data).some(val => 
      typeof val === 'string' && 
      val.startsWith('data:image') && 
      val.length > 10000
    );

  // Thiết lập timeout dài hơn cho các yêu cầu có dữ liệu lớn
  const timeoutDuration = containsLargeData ? 30000 : 10000; // 30s cho dữ liệu lớn, 10s cho mặc định
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
      signal: controller.signal
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error: any) {
    // Xử lý lỗi timeout
    if (error.name === 'AbortError') {
      throw new Error('Yêu cầu quá thời gian, có thể do kích thước dữ liệu quá lớn');
    }
    // Ném lại lỗi gốc nếu không phải AbortError
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

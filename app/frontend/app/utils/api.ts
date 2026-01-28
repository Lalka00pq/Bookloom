const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    let errorData = null;
    try {
      errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
    }
    throw new ApiError(errorMessage, response.status, errorData);
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return {} as T;
  }

  return response.json();
}

export const healthApi = {
  check: async (): Promise<{ status: string }> => {
    return fetchApi<{ status: string }>("/health/check");
  },
};

export const booksSearchApi = {
  search: async (
    query: string,
    maxResults: number = 10,
  ): Promise<import("../schemas/books_search").BookSearchResponse> => {
    return fetchApi<import("../schemas/books_search").BookSearchResponse>(
      "/books/search",
      {
        method: "POST",
        body: JSON.stringify({ query, max_results: maxResults }),
      },
    );
  },
};

export const booksGraphApi = {
  addToGraph: async (
    book: import("../schemas/books_search").BookSearchItem,
  ): Promise<import("../schemas/graph").Node> => {
    return fetchApi<import("../schemas/graph").Node>("/books/add_to_graph", {
      method: "POST",
      body: JSON.stringify(book),
    });
  },
};

export const graphApi = {
  showGraph: async (): Promise<import("../schemas/graph").Graph> => {
    return fetchApi<import("../schemas/graph").Graph>("/graph/show_graph");
  },
  addNode: async (
    request: import("../schemas/graph").AddNodeRequest,
  ): Promise<import("../schemas/graph").Node> => {
    return fetchApi<import("../schemas/graph").Node>("/graph/add_node", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },
  removeNode: async (nodeId: string): Promise<{ message: string }> => {
    return fetchApi<{ message: string }>(`/graph/remove_node/${nodeId}`, {
      method: "DELETE",
    });
  },
  changeNode: async (
    nodeId: string,
    request: import("../schemas/graph").ChangeNodeRequest,
  ): Promise<{ message: string }> => {
    return fetchApi<{ message: string }>(`/graph/change_node/${nodeId}`, {
      method: "PUT",
      body: JSON.stringify(request),
    });
  },
  addEdge: async (
    request: import("../schemas/graph").AddEdgeRequest,
  ): Promise<import("../schemas/graph").Edge> => {
    return fetchApi<import("../schemas/graph").Edge>("/graph/add_edge", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },
  removeEdge: async (
    sourceId: string,
    targetId: string,
  ): Promise<{ message: string }> => {
    return fetchApi<{ message: string }>(
      `/graph/remove_edge/${sourceId}/${targetId}`,
      {
        method: "DELETE",
      },
    );
  },
};

export const recommendationsApi = {
  getRecommendations: async (
    request: import("../schemas/recommendations").UserRecommendationsRequest,
  ): Promise<import("../schemas/recommendations").RecommendationsResponse> => {
    return fetchApi<import("../schemas/recommendations").RecommendationsResponse>(
      "/analytics/recommendations",
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    );
  },
  getSavedRecommendations: async (): Promise<import("../schemas/recommendations").RecommendationsResponse> => {
    return fetchApi<import("../schemas/recommendations").RecommendationsResponse>(
      "/analytics/recommendations",
      {
        method: "GET",
      },
    );
  },
};

export { ApiError };


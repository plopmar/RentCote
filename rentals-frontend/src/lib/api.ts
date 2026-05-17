const API_BASE = "http://localhost:8080";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || "Something went wrong");
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

/* ── Auth ──────────────────────────────── */
export interface AuthResponse {
  id: string;
  name: string;
  email: string;
  token: string;
}

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    request<AuthResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    request<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

/* ── Dashboard ─────────────────────────── */
export interface DashboardResponse {
  totalRentals: number;
  activeRentals: number;
  occupancyRate: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netCashFlow: number;
  averageGrossYield: number;
  next7DaysExpectedIncome: number;
  openIncidents: number;
  trend: { month: string; income: number; expenses: number }[];
  expenseDistribution: { name: string; amount: number }[];
  propertyPerformances: { name: string; income: number; expenses: number; profit: number; status: string }[];
  upcomingExpirations: { rentalName: string; tenantName: string; endDate: string }[];
  recentTransactions: TransactionResponse[];
}

export const dashboardApi = {
  getMetrics: () => request<DashboardResponse>("/api/v1/dashboard"),
};

/* ── Rental Types ───────────────────────── */
export interface RentalTypeResponse {
  id: string;
  name: string;
}

export const rentalTypesApi = {
  getAll: () => request<RentalTypeResponse[]>("/api/v1/rental-types"),
  create: (name: string) => request<RentalTypeResponse>("/api/v1/rental-types", {
    method: "POST",
    body: JSON.stringify({ name })
  }),
  delete: (id: string) => request<void>(`/api/v1/rental-types/${id}`, { method: "DELETE" }),
};

/* ── Expense Types ──────────────────────── */
export interface ExpenseTypeResponse {
  id: string;
  name: string;
}

export const expenseTypesApi = {
  getAll: () => request<ExpenseTypeResponse[]>("/api/v1/expense-types"),
  create: (name: string) => request<ExpenseTypeResponse>("/api/v1/expense-types", {
    method: "POST",
    body: JSON.stringify({ name })
  }),
  delete: (id: string) => request<void>(`/api/v1/expense-types/${id}`, { method: "DELETE" }),
};

/* ── Rentals ───────────────────────────── */
export interface RentalResponse {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  rentalTypeId: string;
  rentalTypeName: string;
  monthlyPrice: number;
  purchasePrice?: number;
  attributes: Record<string, unknown> | null;
  status: string;
}

export interface RentalRequest {
  name: string;
  address: string;
  rentalTypeId: string;
  monthlyPrice: number;
  attributes: Record<string, unknown> | null;
}

export const rentalsApi = {
  getAll: () => request<RentalResponse[]>("/api/v1/rentals"),
  getById: (id: string) => request<RentalResponse>(`/api/v1/rentals/${id}`),
  create: (data: RentalRequest) =>
    request<RentalResponse>("/api/v1/rentals", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/api/v1/rentals/${id}`, { method: "DELETE" }),
};

/* ── Tenants ───────────────────────────── */
export interface TenantResponse {
  id: string;
  ownerId: string;
  fullName: string;
  email: string;
  phone: string;
  dniOrNie: string;
}

export interface TenantRequest {
  fullName: string;
  email: string;
  phone: string;
  dniOrNie: string;
}

export const tenantsApi = {
  getAll: () => request<TenantResponse[]>("/api/v1/tenants"),
  create: (data: TenantRequest) =>
    request<TenantResponse>("/api/v1/tenants", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/api/v1/tenants/${id}`, { method: "DELETE" }),
};

/* ── Contracts ─────────────────────────── */
export interface ContractResponse {
  id: string;
  ownerId: string;
  rentalId: string;
  rentalName: string;
  tenantId: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  status: "ACTIVE" | "TERMINATED" | "PENDING";
  pdfUrl?: string;
}

export interface RentEvolutionResponse {
  id: string;
  contractId: string;
  amount: number;
  startDate: string;
  description: string;
}

export const contractsApi = {
  getAll: () => request<ContractResponse[]>("/api/v1/contracts"),
  create: async (data: any, pdf?: File) => {
    if (pdf) {
      const formData = new FormData();
      formData.append("contract", new Blob([JSON.stringify(data)], { type: "application/json" }));
      formData.append("pdf", pdf);
      
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/v1/contracts", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    }
    return request<ContractResponse>("/api/v1/contracts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (id: string, data: any, pdf?: File | null) => {
    if (pdf) {
      const formData = new FormData();
      formData.append("contract", new Blob([JSON.stringify(data)], { type: "application/json" }));
      formData.append("pdf", pdf);
      
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8080/api/v1/contracts/${id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    }
    
    // Si no hay PDF, enviamos un archivo vacío para cumplir con el contrato del backend 
    // o el backend acepta que el pdf sea opcional en multipart.
    const formData = new FormData();
    formData.append("contract", new Blob([JSON.stringify(data)], { type: "application/json" }));
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:8080/api/v1/contracts/${id}`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });
    if (!res.ok) throw new Error("Update failed");
    return res.json();
  },
  terminate: (id: string) => request<ContractResponse>(`/api/v1/contracts/${id}/terminate`, { method: "POST" }),
  getHistory: (id: string) => request<RentEvolutionResponse[]>(`/api/v1/contracts/${id}/rent-history`),
  addHistory: (id: string, data: any) => request<RentEvolutionResponse>(`/api/v1/contracts/${id}/rent-history`, {
    method: "POST",
    body: JSON.stringify(data)
  }),
  delete: (id: string) => request<void>(`/api/v1/contracts/${id}`, { method: "DELETE" }),
};

/* ── Transactions ──────────────────────── */
export interface TransactionResponse {
  id: string;
  ownerId: string;
  rentalId: string | null;
  contractId: string | null;
  expenseTypeId: string | null;
  expenseTypeName: string | null;
  amount: number;
  type: "INGRESO" | "GASTO";
  status: "PAGADO" | "PENDIENTE" | "ATRASADO";
  dueDate: string;
  paymentDate: string | null;
  description: string;
}

export interface TransactionRequest {
  rentalId?: string | null;
  contractId?: string | null;
  expenseTypeId?: string | null;
  amount: number;
  type: string;
  status: string;
  dueDate: string;
  paymentDate?: string | null;
  description: string;
}

export const transactionsApi = {
  getAll: () => request<TransactionResponse[]>("/api/v1/transactions"),
  create: (data: TransactionRequest) =>
    request<TransactionResponse>("/api/v1/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  markAsPaid: (id: string) =>
    request<TransactionResponse>(`/api/v1/transactions/${id}/pay`, {
      method: "PATCH",
    }),
  generateReceipt: (contractId: string) =>
    request<TransactionResponse>(
      `/api/v1/transactions/generate-receipt/${contractId}`,
      { method: "POST" }
    ),
  delete: (id: string) =>
    request<void>(`/api/v1/transactions/${id}`, { method: "DELETE" }),
};

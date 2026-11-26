import { apiUrl, getAuthHeaders } from "@/common/services/http";

const USERS_URL = "auth/users";
const ROLES_URL = "auth/roles";

export interface UserRecord {
  id: number;
  name: string;
  lastName: string;
  email: string;
  city: string;
  warehouseId: number | null;
  roleIds: number[];
  roleNames: string[];
  createdAt: string | null;
}

export interface RoleRecord {
  id: number;
  name: string;
}

export interface UserInput {
  name: string;
  lastName: string;
  email: string;
  password: string;
  city: string;
  warehouseId: number | null;
  roleIds: number[];
}

export interface UserPage {
  users: UserRecord[];
  totalPages: number;
  totalElements: number;
}

interface UserDto {
  id?: number | null;
  name?: string | null;
  lastName?: string | null;
  email?: string | null;
  city?: string | null;
  warehouseId?: number | null;
  roleIds?: number[] | null;
  roleNames?: string[] | null;
  createdAt?: string | null;
}

interface Envelope<T> {
  data: T;
  pagination?: {
    totalPages?: number | null;
    totalElements?: number | null;
  };
}

function parseUser(dto: UserDto): UserRecord {
  if (typeof dto.id !== "number" || !Number.isSafeInteger(dto.id) || dto.id <= 0) {
    throw new Error("La API devolvió un usuario sin identificador válido.");
  }
  return {
    id: dto.id,
    name: dto.name ?? "",
    lastName: dto.lastName ?? "",
    email: dto.email ?? "",
    city: dto.city ?? "",
    warehouseId: dto.warehouseId ?? null,
    roleIds: dto.roleIds ?? [],
    roleNames: dto.roleNames ?? [],
    createdAt: dto.createdAt ?? null,
  };
}

async function requestError(response: Response, fallback: string): Promise<Error> {
  const result = (await response.json().catch(() => null)) as { message?: string } | null;
  if (response.status === 401 || response.status === 403) {
    return new Error("No tenés permisos para administrar usuarios.");
  }
  return new Error(result?.message ?? `${fallback} (HTTP ${response.status}).`);
}

export async function getUsersRequest(
  page: number,
  size = 10,
  search = ""
): Promise<UserPage> {
  const query = new URLSearchParams({
    page: String(Math.max(0, page - 1)),
    size: String(size),
  });
  if (search.trim()) query.set("search", search.trim());
  const response = await fetch(apiUrl(`${USERS_URL}?${query.toString()}`), {
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!response.ok) throw await requestError(response, "No se pudieron cargar los usuarios");

  const result = (await response.json()) as Envelope<UserDto[]>;
  if (!Array.isArray(result.data)) throw new Error("La API devolvió una lista de usuarios inválida.");
  return {
    users: result.data.map(parseUser),
    totalPages: Math.max(1, result.pagination?.totalPages ?? 1),
    totalElements: Math.max(0, result.pagination?.totalElements ?? result.data.length),
  };
}

export async function getRolesRequest(): Promise<RoleRecord[]> {
  const response = await fetch(apiUrl(ROLES_URL), {
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!response.ok) throw await requestError(response, "No se pudieron cargar los roles");
  const result = (await response.json()) as Envelope<Array<{ id: number; name: string }>>;
  return Array.isArray(result.data) ? result.data : [];
}

export async function createUserRequest(data: UserInput): Promise<UserRecord> {
  const response = await fetch(apiUrl(USERS_URL), {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw await requestError(response, "No se pudo crear el usuario");
  const result = (await response.json()) as Envelope<UserDto>;
  return parseUser(result.data);
}

export async function updateUserRequest(id: number, data: UserInput): Promise<UserRecord> {
  const payload: Partial<UserInput> = { ...data };
  if (!payload.password) delete payload.password;
  return sendUpdate(id, payload);
}

async function sendUpdate(id: number, data: Partial<UserInput>): Promise<UserRecord> {
  const response = await fetch(apiUrl(`${USERS_URL}/${id}`), {
    method: "PUT",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw await requestError(response, "No se pudo actualizar el usuario");
  const result = (await response.json()) as Envelope<UserDto>;
  return parseUser(result.data);
}

export async function deleteUserRequest(id: number): Promise<void> {
  const response = await fetch(apiUrl(`${USERS_URL}/${id}`), {
    method: "DELETE",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!response.ok) throw await requestError(response, "No se pudo eliminar el usuario");
}

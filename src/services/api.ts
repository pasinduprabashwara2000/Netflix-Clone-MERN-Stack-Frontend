const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

// PLAN
export interface Plan {
  _id: string;
  name: string;
  price: number;
  maxStreams: number;
  videoQuality: string;
}

// USER
export interface User {
  _id: string;
  name: string;
  email: string;
  hashedPassword: string;
  role: string;
  isActive: boolean;
}

// SUBSCRIPTION
export interface Subscription {
  _id: string;
  userId: string;
  planId: string;
  status: string;
  startDate: string;
  endDate: string;
  paymentRef: string;
}

// PROFILE
export interface Profile {
  _id: string;
  userId: string;
  name: string;
  avatarUrl: string;
  isKids: boolean;
  language: string;
  maturityLevel: string;
}

// GENRE
export interface Genre {
  _id: string;
  name: string;
  description: string;
}

// CONTENT
export interface Content {
  _id: string;
  title: string;
  description: string;
  type: string;
  releaseYear: number;
  maturityRating: string;
  durationMins: string;
  posterUrl: string;
  bannerUrl: string;
  trailer: string;
  videoUrl: string;
  isFeatured: boolean;
  avgRating: number;
  genreId?: string;
}

// SEASON
export interface Season {
  _id: string;
  seasonNumber: number;
  title: string;
  releaseYear: number;
}

//EPISODE
export interface Episode {
    _id : string;
    seasonId : string;
    episodeNumber : number;
    title : string;
    description : string;
    durationMins : number;
    videoUrl : string;
    thumbNailUrl : string;
}

//WATCHLIST
export interface WatchList {
    _id : string;
    profileId : string;
    contentId : string;
    addedAt : Date
}

// API REQUEST
async function request<T>(
    path: string,
    options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      // FormData sets its own multipart boundary header
      ...(options?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options?.headers,
    },
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail = typeof body.error === "string"
        ? body.error
        : body.error?.message;

    throw new Error(
        [body.message, detail].filter(Boolean).join(" ") ||
        "Request Failed"
    );
  }

  return body as T;
}

// GET LIST
async function getList<T>(path: string): Promise<T[]> {
  const body = await request<T[] | { data?: T[] }>(path);
  return Array.isArray(body) ? body : body.data ?? [];
}

// REUSABLE CRUD API
function makeApi<T extends { _id: string }>(path: string) {
  type Body = Omit<T, "_id">;

  return {
    // GET ALL
    getAll: (): Promise<T[]> =>
        getList<T>(path),

    // CREATE
    create: (data: Body): Promise<T> =>
        request<T>(path, {
          method: "POST",
          body: JSON.stringify(data),
        }),

    // UPDATE
    update: (id: string, data: Partial<Body>): Promise<T> =>
        request<T>(`${path}/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        }),

    // DELETE
    remove: (id: string): Promise<void> =>
        request<void>(`${path}/${id}`, {
          method: "DELETE",
        }),
  };
}

// API EXPORTS
export const planApi = makeApi<Plan>("/plan");
export const userApi = makeApi<User>("/user");
export const subscriptionApi = makeApi<Subscription>("/subscription");
export const profileApi = makeApi<Profile>("/profile");
export const genreApi = makeApi<Genre>("/genre");
export const contentApi = {
  ...makeApi<Content>("/content"),

  // multipart upload: poster image goes in the "poster" field
  createWithPoster: (form: FormData): Promise<Content> =>
      request<Content>("/content", { method: "POST", body: form }),

  updateWithPoster: (id: string, form: FormData): Promise<Content> =>
      request<Content>(`/content/${id}`, { method: "PUT", body: form }),
};
export const seasonApi = makeApi<Season>("/season");
export const episodeApi = makeApi<Episode>("/episode")
export const watchlistApi = makeApi<WatchList>("/watchlist")
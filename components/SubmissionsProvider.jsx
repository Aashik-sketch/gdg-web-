"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { authClient } from "@/lib/auth-client";

/**
 * Tracks which departments the signed-in user has already applied to.
 *
 * Both ids and display names are tracked. Ids are authoritative -- a department
 * can be renamed in constants/departmentNames.js and previously stored
 * submissions must still be recognised -- while names are kept for older
 * records written before ids were stored, and for display.
 */
const EMPTY = Object.freeze([]);

const SubmissionsContext = createContext({
  submittedDepartmentIds: EMPTY,
  submittedDepartments: EMPTY,
  submittedCount: 0,
  isLoadingSubmissions: false,
  markDepartmentsSubmitted: () => {},
  refreshSubmissions: async () => {},
});

/** sessionStorage schema version, bumped when the cached shape changes. */
const CACHE_VERSION = "v2";
const cacheKeyFor = (email) => `submitted_depts_${CACHE_VERSION}_${email}`;

export function SubmissionsProvider({ children }) {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [state, setState] = useState({ ids: EMPTY, names: EMPTY, count: 0 });
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);

  // Track the latest in-flight request so it can be cancelled on unmount or
  // when the active user changes.
  const abortRef = useRef(null);

  const fetchSubmissions = useCallback(async (email, { signal } = {}) => {
    if (!email) return;

    // Cache is an initial-paint optimisation only: paint it immediately if
    // present, but ALWAYS continue to revalidate against the server so the
    // list can't go stale after a submission made in another tab.
    const cacheKey = cacheKeyFor(email);
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && Array.isArray(parsed.ids)) {
            setState({
              ids: parsed.ids,
              names: Array.isArray(parsed.names) ? parsed.names : EMPTY,
              count: Number(parsed.count) || parsed.ids.length,
            });
          }
        } catch {
          /* ignore corrupt cache */
        }
      }
    }

    setIsLoadingSubmissions(true);
    try {
      // The email is derived from the session server-side; no query param.
      const res = await fetch("/api/check-applications", { signal });
      if (!res.ok) return; // 401 when signed out: leave state empty.
      const data = await res.json();

      const next = {
        ids: Array.isArray(data?.submittedDepartmentIds)
          ? data.submittedDepartmentIds
          : EMPTY,
        names: Array.isArray(data?.submittedDepartments)
          ? data.submittedDepartments
          : EMPTY,
        count: Number(data?.count) || 0,
      };
      setState(next);

      if (typeof window !== "undefined") {
        sessionStorage.setItem(cacheKey, JSON.stringify(next));
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.error("Error checking user submissions:", err);
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoadingSubmissions(false);
      }
    }
  }, []);

  useEffect(() => {
    // Cancel any request from a previous user/mount.
    if (abortRef.current) {
      abortRef.current.abort();
    }

    if (!user?.email) {
      setState({ ids: EMPTY, names: EMPTY, count: 0 });
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    fetchSubmissions(user.email, { signal: controller.signal });

    return () => controller.abort();
  }, [user?.email, fetchSubmissions]);

  /**
   * Record a successful submission locally so the UI updates without a refetch.
   * @param {{ids?: string[], names?: string[]}} submitted
   */
  const markDepartmentsSubmitted = useCallback(
    (submitted = {}) => {
      const newIds = submitted.ids ?? [];
      const newNames = submitted.names ?? [];

      setState((prev) => {
        const ids = [...new Set([...prev.ids, ...newIds])];
        const names = [...new Set([...prev.names, ...newNames])];
        const next = { ids, names, count: Math.max(prev.count, ids.length) };

        if (typeof window !== "undefined" && user?.email) {
          sessionStorage.setItem(cacheKeyFor(user.email), JSON.stringify(next));
        }
        return next;
      });
    },
    [user?.email],
  );

  const refreshSubmissions = useCallback(async () => {
    if (!user?.email) return;
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(cacheKeyFor(user.email));
    }
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;
    await fetchSubmissions(user.email, { signal: controller.signal });
  }, [user?.email, fetchSubmissions]);

  const value = useMemo(
    () => ({
      submittedDepartmentIds: state.ids,
      submittedDepartments: state.names,
      submittedCount: Math.max(state.count, state.ids.length),
      isLoadingSubmissions,
      markDepartmentsSubmitted,
      refreshSubmissions,
    }),
    [state, isLoadingSubmissions, markDepartmentsSubmitted, refreshSubmissions],
  );

  return (
    <SubmissionsContext.Provider value={value}>
      {children}
    </SubmissionsContext.Provider>
  );
}

export function useSubmissions() {
  return useContext(SubmissionsContext);
}

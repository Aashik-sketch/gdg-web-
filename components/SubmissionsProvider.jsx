"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { authClient } from "@/lib/auth-client";

const SubmissionsContext = createContext({
  submittedDepartments: [],
  isLoadingSubmissions: false,
  markDepartmentsSubmitted: () => {},
  refreshSubmissions: async () => {},
});

export function SubmissionsProvider({ children }) {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const [submittedDepartments, setSubmittedDepartments] = useState([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);

  // Track the latest in-flight request so it can be cancelled on unmount or
  // when the active user changes.
  const abortRef = useRef(null);

  const fetchSubmissions = useCallback(async (email, { signal } = {}) => {
    if (!email) return;

    // Cache is an initial-paint optimisation only: paint it immediately if
    // present, but ALWAYS continue to revalidate against the server so the
    // list can't go stale after a submission made in another tab.
    const cacheKey = `submitted_depts_${email}`;
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          setSubmittedDepartments(JSON.parse(cached));
        } catch {
          /* ignore corrupt cache */
        }
      }
    }

    setIsLoadingSubmissions(true);
    try {
      // The email is derived from the session server-side; no query param.
      const res = await fetch("/api/check-applications", { signal });
      const data = await res.json();
      if (Array.isArray(data?.submittedDepartments)) {
        setSubmittedDepartments(data.submittedDepartments);
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify(data.submittedDepartments),
          );
        }
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
      setSubmittedDepartments([]);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    fetchSubmissions(user.email, { signal: controller.signal });

    return () => controller.abort();
  }, [user?.email, fetchSubmissions]);

  const markDepartmentsSubmitted = useCallback(
    (newDepartments) => {
      setSubmittedDepartments((prev) => {
        const merged = [...new Set([...prev, ...newDepartments])];
        if (typeof window !== "undefined" && user?.email) {
          sessionStorage.setItem(
            `submitted_depts_${user.email}`,
            JSON.stringify(merged),
          );
        }
        return merged;
      });
    },
    [user?.email],
  );

  const refreshSubmissions = useCallback(async () => {
    if (!user?.email) return;
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(`submitted_depts_${user.email}`);
    }
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;
    await fetchSubmissions(user.email, { signal: controller.signal });
  }, [user?.email, fetchSubmissions]);

  return (
    <SubmissionsContext.Provider
      value={{
        submittedDepartments,
        isLoadingSubmissions,
        markDepartmentsSubmitted,
        refreshSubmissions,
      }}
    >
      {children}
    </SubmissionsContext.Provider>
  );
}

export function useSubmissions() {
  return useContext(SubmissionsContext);
}

"use client";
import React, { useCallback, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import FilterDepartment from "./FilterDepartment";
import FilterShortlisted from "./FilterShortlisted";
import { FaSortAmountDownAlt, FaSortAmountUpAlt, FaSort } from "react-icons/fa";
import { GrPowerReset } from "react-icons/gr";
import { Button } from "./ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Toolbar, ButtonGroup } from "@/components/ui/button-group";
import { EmptyState } from "@/components/ui/stat-card";
import { CheckBoxComp } from "./CheckBoxComp";
import { toast } from "sonner";
import { curDate, curMonth, curYear, months } from "@/constants";
import { IoCloudDownloadOutline, IoSearchOutline } from "react-icons/io5";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  useFilters,
  usePagination,
  useRowSelect,
} from "react-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PaginationComp from "./PaginationComp";
import DialogComp from "./DialogComp";
import MailComposer from "./MailComposer";
import { CSVLink } from "react-csv";
import { CSV_Header } from "@/constants";

const PAGE_SIZES = [10, 20, 50, 100];

const formatQuestionsForCsv = (item) => {
  if (!item?.Questions) return "";

  if (Array.isArray(item.Questions)) {
    return item.Questions
      .map((entry) => {
        if (typeof entry === "string") return entry;
        if (Array.isArray(entry)) return entry.join(": ");
        if (entry && typeof entry === "object") {
          return Object.entries(entry)
            .map(([key, value]) => `${key}: ${value}`)
            .join(" | ");
        }
        return String(entry ?? "");
      })
      .join(" | ");
  }

  if (typeof item.Questions === "object") {
    return Object.entries(item.Questions)
      .map(([question, answer]) => `${question}: ${answer}`)
      .join(" | ");
  }

  return String(item.Questions);
};

const DataTable = ({ data }) => {
  // The canonical row set. Optimistic shortlist toggles mutate this; filtering
  // derives a view from it. `data` is the server snapshot passed down as props.
  const [rows, setRows] = useState(() => data ?? []);

  // Explicit filter STATE rather than the previous reference-equality sentinel.
  const [departmentFilter, setDepartmentFilter] = useState(null); // string | null
  const [shortlistedFilter, setShortlistedFilter] = useState(null); // 'true' | 'false' | null

  // Tracks the applicant id whose shortlist request is in flight so the button
  // can show a spinner. A plain value (not a chained effect) keyed by id.
  const [pendingId, setPendingId] = useState(null);

  // Single source of truth for the visible rows.
  const tableData = useMemo(() => {
    return rows.filter((row) => {
      if (departmentFilter && row.Department !== departmentFilter) return false;
      if (
        shortlistedFilter !== null &&
        String(Boolean(row.shortlisted)) !== shortlistedFilter
      ) {
        return false;
      }
      return true;
    });
  }, [rows, departmentFilter, shortlistedFilter]);

  // Kept separate so "Reset Filters" can clear it without a page reload.
  const [globalFilterState, setGlobalFilterState] = useState("");

  const handleShortlist = useCallback(async (id, isShortlisted) => {
    const nextStatus = !isShortlisted;

    // Optimistic update.
    setRows((prev) =>
      prev.map((applicant) =>
        (applicant._id ?? applicant.id) === id
          ? { ...applicant, shortlisted: nextStatus }
          : applicant
      )
    );
    setPendingId(id);

    try {
      const res = await fetch(`/api/shortlist/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortlisted: nextStatus }),
      });

      let body = null;
      try {
        body = await res.json();
      } catch {
        body = null;
      }

      if (res.ok) {
        toast.success(body?.message || "Applicant status updated");
      } else {
        // Revert the optimistic change.
        setRows((prev) =>
          prev.map((applicant) =>
            (applicant._id ?? applicant.id) === id
              ? { ...applicant, shortlisted: isShortlisted }
              : applicant
          )
        );
        toast.error(body?.message || "Failed to update status");
      }
    } catch (error) {
      setRows((prev) =>
        prev.map((applicant) =>
          (applicant._id ?? applicant.id) === id
            ? { ...applicant, shortlisted: isShortlisted }
            : applicant
        )
      );
      toast.error("Failed to update status. Please try again.");
    } finally {
      setPendingId(null);
    }
  }, []);

  const columns = useMemo(
    () => [
      { Header: "Sr No", accessor: (row, index) => index + 1, id: "srno" },
      { Header: "Name", accessor: "Name" },
      { Header: "Registration Number", accessor: "RegistrationNumber" },
      { Header: "Email", accessor: "Email" },
      { Header: "Phone", accessor: "Phone" },
      { Header: "Department", accessor: "Department" },
      { Header: "Preference", accessor: "Pref" },
      {
        Header: "Status",
        accessor: "shortlisted",
        Cell: ({ row }) => {
          const shortlisted = row.original.shortlisted;
          const name = row.original.Name || "applicant";
          const id = row.original._id ?? row.original.id;
          const pending = pendingId === id;
          return (
            <div className="flex items-center gap-2">
              <Badge
                variant={shortlisted ? "softSuccess" : "softMuted"}
                dot
              >
                {shortlisted ? "Shortlisted" : "Not reviewed"}
              </Badge>
              <Button
                type="button"
                size="sm"
                variant={shortlisted ? "outline" : "default"}
                aria-label={`${
                  shortlisted ? "Remove shortlist from" : "Shortlist"
                } ${name}`}
                disabled={pending}
                onClick={() => handleShortlist(id, shortlisted)}
                className="w-[130px] justify-center gap-2"
              >
                {pending ? (
                  <Spinner size="sm" label="Updating" />
                ) : shortlisted ? (
                  "Unshortlist"
                ) : (
                  "Shortlist"
                )}
              </Button>
            </div>
          );
        },
      },
    ],
    [handleShortlist, pendingId]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    state,
    pageOptions,
    gotoPage,
    pageCount,
    setPageSize,
    setGlobalFilter,
    selectedFlatRows,
  } = useTable(
    {
      columns,
      data: tableData,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((cols) => [
        {
          id: "selection",
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <CheckBoxComp
              {...getToggleAllRowsSelectedProps()}
              aria-label="Select all rows"
            />
          ),
          Cell: ({ row }) => (
            <CheckBoxComp
              {...row.getToggleRowSelectedProps()}
              aria-label={`Select ${row.original.Name || "applicant"}`}
            />
          ),
        },
        ...cols,
      ]);
    }
  );

  const { pageIndex, pageSize } = state;

  const handleGlobalFilterChange = (value) => {
    setGlobalFilterState(value);
    setGlobalFilter(value);
  };

  const resetFilters = () => {
    setDepartmentFilter(null);
    setShortlistedFilter(null);
    setGlobalFilterState("");
    setGlobalFilter("");
  };

  const selectedRecipients = useCallback(
    () =>
      selectedFlatRows.map((row) => ({
        Email: row.original.Email,
        Name: row.original.Name,
        Department: row.original.Department,
      })),
    [selectedFlatRows]
  );

  const showRowData = useCallback(
    () => selectedFlatRows.map((row) => row.original),
    [selectedFlatRows]
  );

  const handleRowSelection = useCallback(
    async (payloadData) => {
      const recipients = selectedRecipients();

      if (recipients.length === 0) {
        toast.error("No recipients selected");
        return;
      }

      const request = { recipients, payloadData };

      try {
        const response = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        });

        let body = null;
        try {
          body = await response.json();
        } catch {
          body = null;
        }

        if (response.status === 503) {
          toast.error(
            body?.message || "Email delivery is not configured on the server."
          );
          return;
        }

        if (response.ok) {
          const failed = body?.failed ?? [];
          if (failed.length) {
            toast.warning(body?.message || `Some emails failed to send.`, {
              description: `Failed: ${failed.join(", ")}`,
            });
          } else {
            toast.success(body?.message || "Invite has been sent!", {
              description: `On ${months[curMonth]} ${curDate}, ${curYear}`,
            });
          }
        } else {
          const failed = body?.failed ?? [];
          toast.error(body?.message || "Failed to send invite", {
            description: failed.length
              ? `Failed: ${failed.join(", ")}`
              : "Please try again later.",
          });
        }
      } catch (error) {
        toast.error("Failed to send invite", {
          description: "Please try again later.",
        });
      }
    },
    [selectedRecipients]
  );

  // Build the CSV payload only when the underlying data changes, not on every
  // render (the user may never click Download).
  const csv_link = useMemo(
    () => ({
      headers: CSV_Header,
      data: rows.map((item) => ({
        ...item,
        Questions: formatQuestionsForCsv(item),
      })),
    }),
    [rows]
  );

  const hasActiveFilter =
    departmentFilter !== null ||
    shortlistedFilter !== null ||
    globalFilterState !== "";

  const selectedCount = selectedFlatRows.length;

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <Toolbar>
        <div className="flex flex-1 flex-col gap-1 min-w-[220px]">
          <Label htmlFor="global-filter">Search applicants</Label>
          <div className="relative">
            <IoSearchOutline
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="global-filter"
              value={globalFilterState}
              onChange={(e) => handleGlobalFilterChange(e.target.value)}
              placeholder="Search by name, email, department…"
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="page-size">Rows per page</Label>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => setPageSize(Number(value))}
          >
            <SelectTrigger
              id="page-size"
              className="w-[120px]"
              aria-label="Rows per page"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <FilterDepartment
          filterFunc={setDepartmentFilter}
          value={departmentFilter}
        />
        <FilterShortlisted
          filterFunc={setShortlistedFilter}
          value={shortlistedFilter}
        />

        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          {selectedCount > 0 && (
            <Badge variant="softInfo" className="mr-1">
              {selectedCount} selected
            </Badge>
          )}
          <ButtonGroup aria-label="Applicant actions">
            <DialogComp selectedApplicants={showRowData} />
            <MailComposer
              recipients={selectedCount}
              handleRowSelection={handleRowSelection}
            />
          </ButtonGroup>
          <Button
            type="button"
            variant="outline"
            onClick={resetFilters}
            disabled={!hasActiveFilter}
            className="flex gap-2"
          >
            <GrPowerReset aria-hidden="true" />
            Reset Filters
          </Button>
          <Button asChild>
            <CSVLink
              {...csv_link}
              filename="applicants.csv"
              className="flex items-center justify-center gap-2"
              aria-label="Download applicants as CSV"
            >
              <IoCloudDownloadOutline aria-hidden="true" />
              Download CSV
            </CSVLink>
          </Button>
        </div>
      </Toolbar>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="max-h-[70vh] overflow-auto rounded-t-lg">
          <Table {...getTableProps()}>
            <TableCaption className="sr-only">
              Applicants list with sorting, filtering and shortlisting controls.
            </TableCaption>
            <TableHeader className="sticky top-0 z-10 bg-muted/95 backdrop-blur supports-[backdrop-filter]:bg-muted/80">
              {headerGroups.map((hg) => {
                // react-table provides a stable key; extract it and pass it
                // explicitly (React 18 disallows a key inside a spread). This
                // replaces the previous Math.random() keys that remounted rows.
                const { key: hgKey, ...hgProps } = hg.getHeaderGroupProps();
                return (
                  <TableRow
                    key={hgKey}
                    {...hgProps}
                    className="border-b border-border hover:bg-transparent"
                  >
                    {hg.headers.map((header) => {
                      const sortable =
                        header.canSort && header.id !== "selection";
                      const ariaSort = header.isSorted
                        ? header.isSortedDesc
                          ? "descending"
                          : "ascending"
                        : "none";
                      const { key: headerKey, ...headerProps } =
                        header.getHeaderProps();
                      return (
                        <TableHead
                          key={headerKey}
                          scope="col"
                          aria-sort={sortable ? ariaSort : undefined}
                          className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                          {...headerProps}
                        >
                          {sortable ? (
                            <button
                              type="button"
                              {...header.getSortByToggleProps()}
                              className="inline-flex items-center gap-1 rounded font-semibold uppercase tracking-wide transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              {header.render("Header")}
                              {header.isSorted ? (
                                header.isSortedDesc ? (
                                  <FaSortAmountDownAlt aria-hidden="true" />
                                ) : (
                                  <FaSortAmountUpAlt aria-hidden="true" />
                                )
                              ) : (
                                <FaSort
                                  aria-hidden="true"
                                  className="opacity-40"
                                />
                              )}
                            </button>
                          ) : (
                            header.render("Header")
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableHeader>
            <TableBody {...getTableBodyProps()}>
              {page.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length + 1} className="p-0">
                    <EmptyState
                      icon={
                        <IoSearchOutline
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      }
                      title={
                        hasActiveFilter
                          ? "No matching applicants"
                          : "No applicants yet"
                      }
                      description={
                        hasActiveFilter
                          ? "No applicants match the current filters. Try broadening or clearing them."
                          : "Applications will appear here once candidates submit."
                      }
                      action={
                        hasActiveFilter ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={resetFilters}
                            className="gap-2"
                          >
                            <GrPowerReset aria-hidden="true" />
                            Clear filters
                          </Button>
                        ) : null
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                page.map((row) => {
                  prepareRow(row);
                  const { key: rowKey, ...rowProps } = row.getRowProps();
                  return (
                    <TableRow
                      key={rowKey}
                      {...rowProps}
                      data-shortlisted={
                        row.original.shortlisted ? "true" : undefined
                      }
                      className={`transition-colors even:bg-muted/30 hover:bg-accent/60 ${
                        row.original.shortlisted
                          ? "bg-success/10 shadow-[inset_3px_0_0_0_hsl(var(--success))] hover:bg-success/20"
                          : ""
                      }`}
                    >
                      {row.cells.map((cell) => {
                        const { key: cellKey, ...cellProps } =
                          cell.getCellProps();
                        return (
                          <TableCell
                            key={cellKey}
                            className="whitespace-nowrap"
                            {...cellProps}
                          >
                            {cell.render("Cell")}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <PaginationComp
          pageIndex={pageIndex}
          pages={pageOptions.length}
          nextPage={nextPage}
          canNext={canNextPage}
          previousPage={previousPage}
          canPrev={canPreviousPage}
          goto={gotoPage}
          pageCount={pageCount}
        />
      </div>
    </div>
  );
};

export default DataTable;

"use client";
import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ButtonGroup } from "@/components/ui/button-group";

import {
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
} from "react-icons/hi";

const PaginationComp = ({
  pageIndex,
  pages,
  nextPage,
  canNext,
  previousPage,
  canPrev,
  goto,
  pageCount,
}) => {
  const pageNum = [];
  for (let i = 1; i <= pageCount; i++) {
    pageNum.push(i);
  }
  let dispPageNum = [pageNum[pageIndex], pageNum[pageIndex + 1], pageNum[pageIndex + 2]];
  dispPageNum = dispPageNum.filter((pg) => pg !== undefined);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
      <p className="text-sm text-muted-foreground">
        Page{" "}
        <span className="font-medium text-foreground tabular-nums">
          {pages === 0 ? 0 : pageIndex + 1}
        </span>{" "}
        of{" "}
        <span className="font-medium text-foreground tabular-nums">{pages}</span>
      </p>
      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent className="cursor-pointer gap-1">
          <ButtonGroup aria-label="Pagination navigation" className="gap-0">
            <PaginationItem
              className={!canPrev ? "pointer-events-none opacity-50" : ""}
            >
              <button
                type="button"
                aria-label="Go to first page"
                disabled={!canPrev}
                onClick={() => goto(0)}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <HiOutlineChevronDoubleLeft aria-hidden="true" />
              </button>
            </PaginationItem>
            <PaginationItem
              className={!canPrev ? "pointer-events-none opacity-50" : ""}
            >
              <PaginationPrevious
                aria-label="Go to previous page"
                onClick={() => previousPage()}
              />
            </PaginationItem>
          </ButtonGroup>
          {dispPageNum.map((num) => (
            <PaginationItem key={num}>
              <PaginationLink
                isActive={pageIndex + 1 === num}
                aria-label={`Go to page ${num}`}
                onClick={() => goto(num - 1)}
              >
                {num}
              </PaginationLink>
            </PaginationItem>
          ))}
          <ButtonGroup aria-label="Pagination navigation forward" className="gap-0">
            <PaginationItem
              className={!canNext ? "pointer-events-none opacity-50" : ""}
            >
              <PaginationNext
                aria-label="Go to next page"
                onClick={() => nextPage()}
              />
            </PaginationItem>
            <PaginationItem
              className={!canNext ? "pointer-events-none opacity-50" : ""}
            >
              <button
                type="button"
                aria-label="Go to last page"
                disabled={!canNext}
                onClick={() => goto(pageCount - 1)}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <HiOutlineChevronDoubleRight aria-hidden="true" />
              </button>
            </PaginationItem>
          </ButtonGroup>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default PaginationComp;

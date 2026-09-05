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
    <div className="flex items-center justify-between p-5 pt-0">
      <div className="w-full p-3 text-sm text-muted-foreground">
        Page {pages === 0 ? 0 : pageIndex + 1} of {pages}
      </div>
      <Pagination>
        <PaginationContent className="cursor-pointer">
          <PaginationItem
            className={!canPrev ? "pointer-events-none opacity-50" : ""}
          >
            <button
              type="button"
              aria-label="Go to first page"
              disabled={!canPrev}
              onClick={() => goto(0)}
              className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <HiOutlineChevronDoubleRight aria-hidden="true" />
            </button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default PaginationComp;

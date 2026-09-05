"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import CarouselComp from "./CarouselComp";
import { toast } from "sonner";

export default function DialogComp({ selectedApplicants }) {
    const applicants = selectedApplicants();
    const [shortlistStatus, setShortlistStatus] = useState([]);

    // Re-seed the local shortlist status whenever the selected set changes.
    // Depend on the derived list (via a stable signature), not on the function
    // identity, which changes every render and previously caused a re-run loop.
    const selectionSignature = applicants
        .map((a) => `${a._id ?? a.id}:${a.shortlisted ? 1 : 0}`)
        .join("|");

    useEffect(() => {
        setShortlistStatus(applicants.map((applicant) => applicant.shortlisted));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectionSignature]);

    const handleShortlist = async (index) => {
        const applicant = applicants[index];
        const isShortlisted = shortlistStatus[index];
        const targetId = applicant._id ?? applicant.id;

        try {
            const res = await fetch(`/api/shortlist/${targetId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ shortlisted: !isShortlisted }),
            });

            let body = null;
            try {
                body = await res.json();
            } catch {
                body = null;
            }

            if (res.ok) {
                const updatedStatus = [...shortlistStatus];
                updatedStatus[index] = !isShortlisted;
                setShortlistStatus(updatedStatus);
                toast.success(
                    `Applicant has been ${
                        !isShortlisted ? "shortlisted" : "unshortlisted"
                    }!`
                );
            } else {
                toast.error(body?.message || "Failed to update status");
            }
        } catch (error) {
            toast.error("Failed to update status. Please try again.");
        }
    };

    const count = applicants.length;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">View Responses</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-[60vw] h-fit">
                <DialogHeader>
                    <div className="flex items-center justify-between gap-3">
                        <DialogTitle>Applicant&apos;s Responses</DialogTitle>
                        <Badge variant={count ? "softInfo" : "softMuted"}>
                            {count} selected
                        </Badge>
                    </div>
                    <DialogDescription>
                        Questions and answers submitted by the selected applicants
                        can be reviewed here.
                    </DialogDescription>
                </DialogHeader>
                <div>
                    {count !== 0 ? (
                        <CarouselComp
                            dataList={applicants}
                            handleShortlist={handleShortlist}
                            shortlistStatus={shortlistStatus}
                        />
                    ) : (
                        <Alert variant="warning">
                            <AlertTitle>No applicants selected</AlertTitle>
                            <AlertDescription>
                                Select one or more applicants from the table to
                                view their questionnaire responses.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

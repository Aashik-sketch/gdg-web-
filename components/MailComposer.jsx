"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { mailingTemplate } from "@/constants";

import OrderedList from "@tiptap/extension-ordered-list";
import BulletList from "@tiptap/extension-bullet-list";
import Blockquote from "@tiptap/extension-blockquote";
import Document from "@tiptap/extension-document";
import Heading from "@tiptap/extension-heading";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { useMemo, useState } from "react";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { CiWarning } from "react-icons/ci";
import { Input } from "./ui/input";
import { Label } from "@/components/ui/label";

const SUBJECT_MAX = 200;
const MAX_RECIPIENTS = 500;

const toolbarButtons = () => [
    { label: "Bold", isActive: "bold", run: (c) => c.toggleBold() },
    { label: "Italic", isActive: "italic", run: (c) => c.toggleItalic() },
    { label: "Strike", isActive: "strike", run: (c) => c.toggleStrike() },
    { label: "Code", isActive: "code", run: (c) => c.toggleCode() },
    { label: "Paragraph", isActive: "paragraph", run: (c) => c.setParagraph() },
    {
        label: "Heading",
        isActive: { name: "heading", opts: { level: 1 } },
        run: (c) => c.toggleHeading({ level: 1 }),
    },
    { label: "Bullet list", isActive: "bulletList", run: (c) => c.toggleBulletList() },
    { label: "Ordered list", isActive: "orderedList", run: (c) => c.toggleOrderedList() },
    { label: "Blockquote", isActive: "blockquote", run: (c) => c.toggleBlockquote() },
];

export default function MailComposer({ recipients, handleRowSelection }) {
    const [payloadData, setPayloadData] = useState({
        subject: "",
        body: "",
        mailType: "",
    });
    const [confirm, setConfirm] = useState(false);
    const [sending, setSending] = useState(false);

    const templateTypes = ["Blank", "Interview Invite"];

    const editor = useEditor({
        extensions: [
            StarterKit,
            Document,
            Paragraph,
            Text,
            Heading.configure({
                levels: [1],
                HTMLAttributes: { class: `text-4xl font-bold` },
            }),
            Blockquote.configure({
                HTMLAttributes: {
                    class: "border-l-2 border-border pl-4 opacity-[80%]",
                },
            }),
            BulletList.configure({ HTMLAttributes: { class: "list-disc ml-5" } }),
            OrderedList.configure({ HTMLAttributes: { class: "list-decimal ml-5" } }),
        ],
        content: "",
        immediatelyRender: false,
        onUpdate: ({ editor: ed }) => {
            setPayloadData((prev) => ({ ...prev, body: ed.getHTML() }));
        },
        editorProps: {
            attributes: {
                class: "min-h-[150px] cursor-text rounded-md border border-input p-5 ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            },
        },
    });

    const bodyText = payloadData.body
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim();
    const subjectText = payloadData.subject.trim();

    const validationError = useMemo(() => {
        if (!recipients || recipients === 0) return "No recipients selected.";
        if (recipients > MAX_RECIPIENTS)
            return `Too many recipients (max ${MAX_RECIPIENTS}).`;
        if (!subjectText) return "A subject is required.";
        if (subjectText.length > SUBJECT_MAX)
            return `Subject must be ${SUBJECT_MAX} characters or fewer.`;
        if (!bodyText) return "The email body cannot be empty.";
        return null;
    }, [recipients, subjectText, bodyText]);

    const canSend = confirm && !validationError && !sending;

    const onSend = async () => {
        if (validationError) return;
        setSending(true);
        try {
            await handleRowSelection(payloadData);
            setConfirm(false);
        } finally {
            setSending(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Custom Mail</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] overflow-x-hidden sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[75vw]">
                <DialogHeader>
                    <DialogTitle>Send Custom Mail</DialogTitle>
                    <DialogDescription>
                        Send customized mail to {recipients || 0} selected
                        recipient{recipients === 1 ? "" : "s"}.
                    </DialogDescription>
                </DialogHeader>

                {recipients !== 0 ? (
                    <div className="flex flex-col justify-between gap-3">
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                <div className="flex flex-1 flex-col gap-1">
                                    <Label htmlFor="mail-subject">Subject</Label>
                                    <Input
                                        id="mail-subject"
                                        value={payloadData.subject}
                                        maxLength={SUBJECT_MAX}
                                        placeholder="Subject"
                                        onChange={(e) =>
                                            setPayloadData((prev) => ({
                                                ...prev,
                                                subject: e.target.value,
                                            }))
                                        }
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        {subjectText.length}/{SUBJECT_MAX}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="mail-template">Template</Label>
                                    <Select
                                        onValueChange={(value) => {
                                            switch (value) {
                                                case "Blank":
                                                    editor?.commands.setContent("");
                                                    break;
                                                case "Interview Invite":
                                                    setPayloadData((prev) => ({
                                                        ...prev,
                                                        mailType: value,
                                                    }));
                                                    editor?.commands.setContent(
                                                        mailingTemplate.Interview
                                                    );
                                                    break;
                                                default:
                                                    editor?.commands.setContent("");
                                            }
                                        }}
                                    >
                                        <SelectTrigger
                                            id="mail-template"
                                            className="w-[200px]"
                                            aria-label="Choose an email template"
                                        >
                                            <SelectValue placeholder="Templates" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {templateTypes.map((tmp_type) => (
                                                <SelectItem
                                                    key={tmp_type}
                                                    value={tmp_type}
                                                >
                                                    {tmp_type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {editor && (
                                <div
                                    className="flex max-w-full flex-wrap gap-1 pb-3"
                                    role="toolbar"
                                    aria-label="Text formatting"
                                >
                                    {toolbarButtons().map((btn) => {
                                        const active =
                                            typeof btn.isActive === "string"
                                                ? editor.isActive(btn.isActive)
                                                : editor.isActive(
                                                      btn.isActive.name,
                                                      btn.isActive.opts
                                                  );
                                        return (
                                            <Button
                                                key={btn.label}
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                aria-pressed={active}
                                                onClick={() =>
                                                    btn.run(
                                                        editor.chain().focus()
                                                    ).run()
                                                }
                                                className={active ? "bg-accent" : ""}
                                            >
                                                {btn.label}
                                            </Button>
                                        );
                                    })}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            editor.chain().focus().undo().run()
                                        }
                                    >
                                        Undo
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            editor.chain().focus().redo().run()
                                        }
                                    >
                                        Redo
                                    </Button>
                                </div>
                            )}

                            <EditorContent editor={editor} />

                            {validationError && (
                                <p className="flex items-center gap-2 text-sm text-destructive">
                                    <CiWarning aria-hidden="true" />
                                    {validationError}
                                </p>
                            )}
                        </div>

                        <DialogFooter className="flex gap-3">
                            {!confirm ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={!!validationError}
                                    onClick={() => setConfirm(true)}
                                >
                                    Verify Mail
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled
                                    className="cursor-not-allowed text-muted-foreground"
                                >
                                    Verified
                                </Button>
                            )}
                            <Button
                                type="submit"
                                disabled={!canSend}
                                onClick={onSend}
                            >
                                {sending ? "Sending…" : "Send Mail"}
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <p className="flex items-center justify-start gap-3 text-md font-light text-muted-foreground">
                        <CiWarning aria-hidden="true" /> No recipients selected
                    </p>
                )}
            </DialogContent>
        </Dialog>
    );
}

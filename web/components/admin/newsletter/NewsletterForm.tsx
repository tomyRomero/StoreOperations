"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/lib/api/browser";
import { fieldErrors, problemMessage } from "@/lib/api/problems";

const FormSchema = z.object({
  subject: z.string().trim().min(1, "Enter a subject").max(150, "Use at most 150 characters"),
  body: z.string().trim().min(20, "Write at least 20 characters").max(10_000, "Use at most 10,000 characters"),
});

type Values = z.infer<typeof FormSchema>;

const subscribers = (n: number) => `${n} subscriber${n === 1 ? "" : "s"}`;

// Writes a plain-text newsletter. The API queues one email per subscriber, each with its own
// unsubscribe link, and a test goes to the signed-in admin only.
export function NewsletterForm({ subscriberCount }: { subscriberCount: number }) {
  const [sending, setSending] = useState<"test" | "all" | null>(null);
  const [confirming, setConfirming] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(FormSchema),
    defaultValues: { subject: "", body: "" },
  });

  const send = async (test: boolean) => {
    const values = form.getValues();
    setSending(test ? "test" : "all");
    const { data, error } = test
      ? await api.POST("/api/admin/newsletter/send-test", { body: values })
      : await api.POST("/api/admin/newsletter/send", { body: values });
    setSending(null);

    if (!data) {
      for (const [field, message] of Object.entries(fieldErrors(error))) {
        if (field in values) form.setError(field as keyof Values, { message });
      }
      toast({ variant: "destructive", title: test ? "Couldn't send the test" : "Couldn't send the newsletter", description: problemMessage(error) });
      return;
    }

    if (test) {
      toast({ variant: "success", title: "Test sent to your email" });
      return;
    }
    toast({ variant: "success", title: "Newsletter on its way", description: `Queued for ${subscribers(data.recipients)}.` });
    form.reset();
  };

  return (
    <>
      <Form {...form}>
        <form className="grid gap-5" onSubmit={form.handleSubmit(() => setConfirming(true))} noValidate>
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea rows={10} {...field} />
                </FormControl>
                <FormDescription>Plain text. Blank lines start new paragraphs, and every email ends with a link to unsubscribe.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={sending === "all"} disabled={sending !== null || subscriberCount === 0}>
              <Send aria-hidden />
              Send to {subscribers(subscriberCount)}
            </Button>
            <Button type="button" variant="outline" loading={sending === "test"} disabled={sending !== null} onClick={form.handleSubmit(() => send(true))}>
              Send me a test
            </Button>
          </div>
        </form>
      </Form>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send this newsletter to {subscribers(subscriberCount)}?</AlertDialogTitle>
            <AlertDialogDescription>Emails can&apos;t be called back once they&apos;re sent. Send yourself a test first if you haven&apos;t.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not yet</AlertDialogCancel>
            <AlertDialogAction onClick={() => void send(false)}>Send newsletter</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

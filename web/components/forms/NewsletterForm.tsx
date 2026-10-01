"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { toast } from '../ui/use-toast';
import { api } from '@/lib/api/browser';
import { fieldErrors, problemMessage } from '@/lib/api/problems';

const FormSchema = z.object({
  subject: z.string().trim().min(1, 'Enter a subject').max(150, 'Use at most 150 characters'),
  body: z.string().trim().min(20, 'Write at least 20 characters').max(10_000, 'Use at most 10,000 characters'),
});

type Values = z.infer<typeof FormSchema>;

// Writes a plain-text newsletter. The API queues one email per subscriber, each with its own
// unsubscribe link, and a test goes to the signed-in admin only.
const NewsletterForm = ({ subscriberCount }: { subscriberCount: number }) => {
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(FormSchema),
    defaultValues: { subject: "", body: "" },
  });

  const send = async (test: boolean) => {
    const values = form.getValues();
    setSending(true);
    const { data, error } = test
      ? await api.POST("/api/admin/newsletter/send-test", { body: values })
      : await api.POST("/api/admin/newsletter/send", { body: values });
    setSending(false);

    if (!data) {
      for (const [field, message] of Object.entries(fieldErrors(error))) {
        if (field in values) form.setError(field as keyof Values, { message });
      }
      toast({ title: test ? "Couldn't send the test" : "Couldn't send the newsletter", description: problemMessage(error), variant: "destructive" });
      return;
    }

    if (test) {
      toast({ title: "Test sent to your email" });
      return;
    }
    toast({ title: "Newsletter on its way", description: `Queued for ${data.recipients} subscriber${data.recipients === 1 ? "" : "s"}.` });
    form.reset();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
    <CardHeader>
      <CardTitle className="text-heading3-bold">Write a newsletter</CardTitle>
      <CardDescription>Plain text. Each email ends with a link to unsubscribe.</CardDescription>
    </CardHeader>
    <CardContent>
    <Form {...form}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(() => setConfirming(true))}>
        <FormField
          control={form.control}
          name='subject'
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
          name='body'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea rows={10} {...field} />
              </FormControl>
              <FormDescription>Blank lines start new paragraphs.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-wrap gap-4">
          <Button type="button" variant="outline" disabled={sending} onClick={form.handleSubmit(() => send(true))}>
            Send me a test
          </Button>
          <Button type="submit" disabled={sending || subscriberCount === 0}>
            Send to {subscriberCount} subscriber{subscriberCount === 1 ? "" : "s"}
          </Button>
        </div>
      </form>
    </Form>
    </CardContent>

    <AlertDialog open={confirming} onOpenChange={setConfirming}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Send this newsletter to {subscriberCount} subscriber{subscriberCount === 1 ? "" : "s"}?</AlertDialogTitle>
          <AlertDialogDescription>Emails can&apos;t be called back once they&apos;re sent. Send yourself a test first if you haven&apos;t.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Not yet</AlertDialogCancel>
          <AlertDialogAction onClick={() => void send(false)}>Send newsletter</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </Card>
  )
}

export default NewsletterForm;

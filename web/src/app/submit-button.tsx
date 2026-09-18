"use client";
import { useFormStatus } from "react-dom";
export function SubmitButton({ children, pendingText = "Saving…" }: { children: React.ReactNode; pendingText?: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" className="button" disabled={pending}>{pending ? pendingText : children}</button>;
}

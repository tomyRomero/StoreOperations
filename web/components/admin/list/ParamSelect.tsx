"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { fieldClasses } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  // The address parameter this select sets, such as "category"
  param: string;
  // The first option clears the parameter
  anyLabel: string;
  options: { value: string; label: string }[];
};

// A filter as a native select: changing it updates the address, keeps the other filters and goes back to page 1
export function ParamSelect({ label, param, anyLabel, options }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const change = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(param, value);
    else params.delete(param);
    params.delete("page");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <label className="grid gap-1 text-sm">
      <span className="sr-only">{label}</span>
      <select
        value={searchParams.get(param) ?? ""}
        onChange={(event) => change(event.target.value)}
        className={cn(fieldClasses, "h-10 w-auto py-0 pr-8", searchParams.has(param) && "border-foreground font-semibold")}
      >
        <option value="">{anyLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

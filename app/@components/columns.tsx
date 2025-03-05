"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LogEntry } from "@/app/types";
import { toast } from "sonner";

export const REDEEMED_COLUMNS: ColumnDef<LogEntry>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => {
      return <div className="font-medium text-xs">{row.getValue("code")}</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      return (
        <Badge
          className="text-[10px] py-0 px-1.5"
          variant={status === "SUCCESS" ? "default" : status === "FAILED" ? "destructive" : "outline"}
        >
          {status}
        </Badge>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string;
      const formatted = format(new Date(createdAt), "dd/MM/yy hh:mm a"); 

      return <div className="text-xs">{formatted}</div>;
    },
    enableSorting: true,
    sortingFn: "datetime",
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const message = row.original.message;

      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            toast.message("Log Details", {
              description: message,
            });
          }}
          className="h-5 w-5 p-0"
        >
          <Eye className="h-3 w-3" />
          <span className="sr-only">View details</span>
        </Button>
      );
    },
    enableSorting: false,
  },
];

export const DAILY_CHECK_IN_COLUMNS: ColumnDef<LogEntry>[] = [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      return (
        <Badge
          className="text-[10px] py-0 px-1.5"
          variant={status === "SUCCESS" ? "default" : status === "FAILED" ? "destructive" : "outline"}
        >
          {status}
        </Badge>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string;
      const formatted =  format(new Date(createdAt), "dd/MM/yy hh:mm a"); 

      return <div className="text-xs">{formatted}</div>;
    },
    enableSorting: true,
    sortingFn: "datetime",
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const message = row.original.message;

      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            toast.message("Log Details", {
              description: message,
            });
          }}
          className="h-5 w-5 p-0"
        >
          <Eye className="h-3 w-3" />
          <span className="sr-only">View details</span>
        </Button>
      );
    },
    enableSorting: false,
  },
];

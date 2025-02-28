// "use client"

// import type { ColumnDef } from "@tanstack/react-table"
// import { Badge } from "@/components/ui/badge"
// import { format } from "date-fns"
// import { Eye } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import type { LogEntry } from "./types.ts"
// import { toast } from "sonner"

// export const columns: ColumnDef<LogEntry>[] = [
//   {
//     accessorKey: "code",
//     header: "Redeem Code",
//     cell: ({ row }) => {
//       return <div className="font-medium">{row.getValue("code")}</div>
//     },
//   },
//   {
//     accessorKey: "status",
//     header: "Status",
//     cell: ({ row }) => {
//       const status = row.getValue("status") as string

//       return (
//         <Badge className="" variant={status === "success" ? "default" : status === "error" ? "destructive" : "outline"}>
//           {status}
//         </Badge>
//       )
//     },
//   },
//   {
//     accessorKey: "createdAt",
//     header: "Date & Time",
//     cell: ({ row }) => {
//       const createdAt = row.getValue("createdAt") as string
//       const formatted = format(new Date(createdAt), "PPp")

//       return <div>{formatted}</div>
//     },
//   },
//   {
//     id: "actions",
//     cell: ({ row }) => {
//       const message = row.original.message

//       return (
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={() => {
//             toast.message('Log Details', {
//               description: message,
//             })
//           }}
//         >
//           <Eye className="h-4 w-4" />
//           <span className="sr-only">View details</span>
//         </Button>
//       )
//     },
//   },
// ]

"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { LogEntry } from "./types"
import { toast } from "sonner"

export const columns: ColumnDef<LogEntry>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => {
      return <div className="font-medium text-xs">{row.getValue("code")}</div>
    },
    enableSorting: true,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string

      return (
        <Badge
          className="text-[10px] py-0 px-1.5"
          variant={status === "success" ? "default" : status === "error" ? "destructive" : "outline"}
        >
          {status}
        </Badge>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string
      const formatted = format(new Date(createdAt), "dd/MM/yy HH:mm")

      return <div className="text-xs">{formatted}</div>
    },
    enableSorting: true,
    sortingFn: "datetime",
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const message = row.original.message

      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            toast.message("Log Details", {
              description: message,
            })
          }}
          className="h-5 w-5 p-0"
        >
          <Eye className="h-3 w-3" />
          <span className="sr-only">View details</span>
        </Button>
      )
    },
    enableSorting: false,
  },
]


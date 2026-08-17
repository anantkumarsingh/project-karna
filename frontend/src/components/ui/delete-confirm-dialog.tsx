"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  itemLabel,
  warningLines,
  loadingWarnings,
  onConfirm,
  deleting,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemLabel: string
  warningLines: string[]
  loadingWarnings: boolean
  onConfirm: () => void
  deleting: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete &quot;{itemLabel}&quot;?</DialogTitle>
          <DialogDescription>This cannot be undone.</DialogDescription>
        </DialogHeader>

        {loadingWarnings ? (
          <p className="text-xs text-gray-400">Checking what's linked to this item…</p>
        ) : (
          warningLines.length > 0 && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <ul className="text-xs text-amber-800 leading-relaxed list-disc pl-4 space-y-1">
                {warningLines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )
        )}

        <DialogFooter>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={deleting || loadingWarnings}
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

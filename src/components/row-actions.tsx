"use client";

import { Pencil, Trash2 } from "lucide-react";
import ConfirmDelete from "@/components/confirm-delete";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ActionResult } from "@/lib/action";

export default function RowActions({
  onEdit,
  destroy,
  deleteTitle,
  deleteDescription,
}: {
  onEdit?: () => void;
  destroy?: () => Promise<ActionResult>;
  deleteTitle?: string;
  deleteDescription?: string;
}) {
  return (
    <div className="flex justify-end gap-1">
      {onEdit && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" className="size-8" onClick={onEdit}>
              <Pencil />
              <span className="sr-only">Ubah</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ubah</TooltipContent>
        </Tooltip>
      )}
      {destroy && (
        <ConfirmDelete action={destroy} title={deleteTitle} description={deleteDescription}>
          <Button size="icon" variant="ghost" className="size-8 text-destructive hover:text-destructive">
            <Trash2 />
            <span className="sr-only">Hapus</span>
          </Button>
        </ConfirmDelete>
      )}
    </div>
  );
}

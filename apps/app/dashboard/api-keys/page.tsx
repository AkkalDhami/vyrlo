/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/preserve-manual-memoization */
"use client";

import React from "react";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Lock, Key, Trash2, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from "@clerk/nextjs";
import { useApiKey } from "@/hooks/use-api-key";
import { getApiKeys } from "@/lib/api/api-key";
import { useQuery } from "@tanstack/react-query";
import { formatDistance, subDays } from "date-fns";
import { CopyButton } from "@/components/common/copy-button";
import { cn } from "@/lib/utils";

import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";

const statusColors = {
  active: "var(--color-brand-500)",
  revoked: "var(--color-red-500)",
};

type APIKeyType = {
  id: string;
  prefix: string;
  createdAt: string;
  lastUsedAt?: string | null;
  revokedAt?: string | null;
};

export default function Page() {
  const { isLoaded, isSignedIn } = useUser();

  const [selected, setSelected] = React.useState<APIKeyType | null>(null);
  const [revealOpen, setRevealOpen] = React.useState(false);
  const [generatedSecret, setGeneratedSecret] = React.useState<string | null>(
    null,
  );

  const { data: keys, isFetching: isFetchingApiKeys } = useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const res = await getApiKeys();

      return res as APIKeyType[];
    },
    enabled: isLoaded && isSignedIn,
  });

  const { createApiKey, isCreatingApiKey, revokeApiKey, isRevokingApiKey } =
    useApiKey();

  const createKey = async () => {
    try {
      const res = await createApiKey();

      setGeneratedSecret(res.key);
      setRevealOpen(true);

      toast.success("API key created successfully!");
    } catch (e) {
      toast.error("Failed to create API key");
      console.error({ e });
    }
  };

  const revokeSelected = async () => {
    try {
      if (!selected?.id) return;

      await revokeApiKey(selected.id);

      toast.success("API key revoked successfully!");

      setSelected(null);
    } catch (error) {
      console.error({ error });
      toast.error("Failed to revoke API key");
    }
  };

  const activeCount =
    React.useMemo(() => keys?.filter((k) => !k.revokedAt).length, [keys]) || 0;

  const limitReached = (activeCount || 0) >= 5;

  const revokedCount = React.useMemo(
    () => keys?.filter((k) => k.revokedAt).length,
    [keys],
  );
  const lastGeneratedAgo = React.useMemo(() => {
    const timestamps =
      keys
        ?.map((k: { createdAt: string }) => Date.parse(k.createdAt))
        ?.filter((t: unknown) => !Number.isNaN(t)) ?? [];

    if (timestamps?.length === 0) return "—";
    const latest = Math.max(...timestamps);
    const diffMs = Date.now() - latest;
    const secs = Math.floor(diffMs / 1000);
    const mins = Math.floor(secs / 60);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days >= 1) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours >= 1) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (mins >= 1) return `${mins} min${mins > 1 ? "s" : ""} ago`;
    return "just now";
  }, [keys]);

  function setGenerateOpen(arg0: boolean): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">API Keys</h1>
          <p className="text-sm text-muted-foreground">
            Manage and secure your project access credentials.
          </p>
        </div>
        {/* Disable generate button at limit; show tooltip */}
        <span className="inline-flex">
          <Button
            className="rounded-md"
            onClick={() => createKey()}
            disabled={limitReached || isCreatingApiKey}
          >
            <Plus className="h-4 w-4" />
            Generate New Key
          </Button>
        </span>
      </div>

      {/* Info Card */}
      <div className="rounded-md bg-background border">
        <div className="flex items-start gap-3 p-6">
          <div className="mt-0.5">
            <Lock className="h-5 w-5 opacity-70" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium">API Key Security</h3>
            <p className="text-sm text-muted-foreground">
              Your API keys are sensitive credentials. Treat them like passwords
              — never share them publicly or commit them to version control.
              Each key is unique per project and can be revoked instantly if
              compromised. You will only see your key once upon creation for
              your security.
            </p>
          </div>
        </div>
      </div>

      {/* Keys Table */}
      <div className="rounded-md border">
        {keys && keys?.length > 0 && (
          <div className="flex items-center justify-between px-3 py-2">
            <h3 className="text-sm font-medium">Your API Keys</h3>
            <span className="text-xs text-muted-foreground">
              {keys?.length} keys
            </span>
          </div>
        )}

        {keys?.length === 0 ? (
          isFetchingApiKeys ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading saved API keys…
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Key className="mr-2 h-4 w-4" />
              No API keys created yet. Generate one to start using the OneMinute
              Logs API.
            </div>
          )
        ) : (
          <div className="relative">
            {/* Overlay spinner while refreshing keys list */}
            {isFetchingApiKeys && (
              <div className="absolute top-12 flex items-center justify-center bg-background/40 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Refreshing keys…
                </div>
              </div>
            )}

            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Prefix</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys?.map((k, idx: any) => (
                  <TableRow
                    key={`${k.id}-${idx}`}
                    className="cursor-pointer transition-colors hover:bg-white/5"
                    onClick={() => setSelected(k)}
                  >
                    <TableCell className="text-muted-foreground">
                      {k.prefix}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistance(subDays(k.createdAt, 0), new Date(), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {k.lastUsedAt
                        ? formatDistance(subDays(k.lastUsedAt, 0), new Date(), {
                            addSuffix: true,
                          })
                        : "Not used yet"}
                    </TableCell>
                    <TableCell className="font-medium flex items-center gap-1">
                      <span
                        className={cn(
                          "size-2.5 rounded-full animate-pulse",
                          k.revokedAt ? "bg-red-500" : "bg-green-500",
                        )}
                      />
                      <span
                        style={{
                          color:
                            statusColors[!k.revokedAt ? "active" : "revoked"],
                        }}
                      >
                        {!k.revokedAt ? "active" : "revoked"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!k.revokedAt && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-lg"
                                  disabled={
                                    activeCount <= 1 && k.status === "Active"
                                  }
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (
                                      activeCount <= 1 &&
                                      k.status === "Active"
                                    ) {
                                      toast.error(
                                        "Cannot revoke the only active API key",
                                      );
                                      return;
                                    }
                                    setSelected(k);
                                    await revokeSelected();
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Revoke
                                </Button>
                              </span>
                            </TooltipTrigger>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Key Detail Drawer (right side) */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="fixed right-0 top-0 h-full bg-background w-105 border-l p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">API Key Details</h3>
              <div className="flex gap-2">
                {!selected.revokedAt && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-md"
                          disabled={isRevokingApiKey}
                          onClick={revokeSelected}
                        >
                          {isRevokingApiKey ? (
                            <>
                              <Spinner />
                              Revoking...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4" />
                              Revoke
                            </>
                          )}
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={6}>
                      {activeCount && activeCount <= 1 && selected?.revokedAt
                        ? "Cannot revoke the only active API key"
                        : "Revoke this API key"}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            <div className="mt-3 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prefix</span>
                <span>{selected?.prefix}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>
                  {new Date(selected.createdAt || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Used</span>
                <span>
                  {selected.lastUsedAt
                    ? formatDistance(
                        subDays(selected.lastUsedAt, 0),
                        new Date(),
                        { addSuffix: true },
                      )
                    : "Not used yet"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      selected.revokedAt ? "text-red-500" : "text-green-500",
                    )}
                  >
                    {selected.revokedAt ? "revoked" : "active"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* One-time Secret Reveal Dialog */}
      <Dialog
        open={revealOpen}
        onOpenChange={(open) => {
          setRevealOpen(open);
          // if (!open) setGeneratedSecret(null);
        }}
      >
        <DialogContent
          className="sm:max-w-130"
          // overlayClassName="fixed inset-0 z-50 bg-black/30 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out">
        >
          <DialogHeader>
            <DialogTitle>Your New API Key</DialogTitle>
            <DialogDescription>
              You will only see this key once. Copy and store it securely.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-md border p-3 text-sm font-mono">
              <div className="text-xs text-muted-foreground mb-1">Secret</div>
              <div className="flex items-start justify-between gap-2">
                <span className="flex-1 min-w-0 text-xs break-all">
                  {generatedSecret ?? "—"}
                </span>
                <CopyButton className="relative" text={generatedSecret ?? ""} />
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              For security, we cannot show this key again or recover it later.
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                className="rounded-md"
                onClick={() => setRevealOpen(false)}
              >
                I stored it safely
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer status bar */}
      <div
        className="flex items-center justify-between rounded-md border px-3 py-2 text-xs"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex items-center gap-6">
          <span className="text-muted-foreground">Active Keys</span>
          <span className="font-medium">{activeCount}</span>
          <span className="text-muted-foreground">Revoked</span>
          <span className="font-medium">{revokedCount}</span>
          <span className="text-muted-foreground">Last Generated</span>
          <span className="font-medium">{lastGeneratedAgo}</span>
        </div>
      </div>
    </div>
  );
}

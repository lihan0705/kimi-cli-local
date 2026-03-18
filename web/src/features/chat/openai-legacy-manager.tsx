import { useCallback, useState, type ReactElement } from "react";
import { toast } from "sonner";
import { Trash2, Plus, Globe, Key, Eye, EyeOff } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader } from "@/components/ai-elements/loader";
import { Separator } from "@/components/ui/separator";
import { useOpenAILegacyProviders } from "@/hooks/useOpenAILegacyProviders";
import type { GlobalConfig } from "@/lib/api/models";

export type OpenAILegacyManagerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigUpdate: (config: GlobalConfig) => void;
};

export function OpenAILegacyManager({
  open,
  onOpenChange,
  onConfigUpdate,
}: OpenAILegacyManagerProps): ReactElement {
  const {
    providers,
    isLoading,
    isUpdating,
    addProvider,
    deleteProvider,
  } = useOpenAILegacyProviders();

  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newKey, setNewKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const handleAdd = useCallback(async () => {
    if (!newName || !newUrl) {
      toast.error("Name and Base URL are required");
      return;
    }

    try {
      const config = await addProvider({
        name: newName,
        baseUrl: newUrl,
        apiKey: newKey || undefined,
      });
      onConfigUpdate(config);
      toast.success(`Provider "${newName}" added`);
      setNewName("");
      setNewUrl("");
      setNewKey("");
    } catch (err) {
      toast.error("Failed to add provider");
    }
  }, [newName, newUrl, newKey, addProvider, onConfigUpdate]);

  const handleDelete = useCallback(async (name: string) => {
    try {
      const config = await deleteProvider(name);
      onConfigUpdate(config);
      toast.success(`Provider "${name}" deleted`);
    } catch (err) {
      toast.error("Failed to delete provider");
    }
  }, [deleteProvider, onConfigUpdate]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] border-[#e5e7eb] bg-white p-0 overflow-hidden flex flex-col gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-[#111827] text-xl">OpenAI Legacy URLs</DialogTitle>
          <DialogDescription className="text-[#6b7280]">
            Manage custom OpenAI-compatible endpoints.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
              Configured Endpoints
            </Label>
            <ScrollArea className="h-[160px] rounded-md border border-[#e5e7eb] bg-[#fcfcfc]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader size={20} />
                </div>
              ) : providers.length > 0 ? (
                <div className="p-1 space-y-1">
                  {providers.map((p) => (
                    <div
                      key={p.name}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-white border border-transparent hover:border-[#e5e7eb] transition-all group"
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-sm font-semibold text-[#111827] truncate">
                          {p.name}
                        </span>
                        <span className="text-xs text-[#6b7280] truncate">
                          {p.baseUrl}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-[#6b7280] hover:text-red-600 hover:bg-red-50 shrink-0"
                        onClick={() => handleDelete(p.name)}
                        disabled={isUpdating}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[#6b7280] gap-2 py-8">
                  <Globe className="size-8 opacity-20" />
                  <span className="text-xs">No custom URLs configured.</span>
                </div>
              )}
            </ScrollArea>
          </div>

          <Separator className="bg-[#e5e7eb]" />

          <div className="space-y-4">
            <Label className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider flex items-center gap-2">
              <Plus className="size-3.5" /> Add New Endpoint
            </Label>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-medium text-[#111827]">
                  Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. deepseek"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-9 border-[#e5e7eb] focus-visible:ring-[#111827]"
                  disabled={isUpdating}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="url" className="text-sm font-medium text-[#111827]">
                  Base URL
                </Label>
                <Input
                  id="url"
                  placeholder="https://api.deepseek.com/v1"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="h-9 border-[#e5e7eb] focus-visible:ring-[#111827]"
                  disabled={isUpdating}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="key" className="text-sm font-medium text-[#111827]">
                  API Key (Optional)
                </Label>
                <div className="relative">
                  <Input
                    id="key"
                    type={showKey ? "text" : "password"}
                    placeholder="sk-..."
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    className="h-9 border-[#e5e7eb] focus-visible:ring-[#111827] pr-9"
                    disabled={isUpdating}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-9 w-9 text-[#6b7280] hover:bg-transparent"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 border-t border-[#e5e7eb] bg-[#fcfcfc]">
          <Button
            variant="ghost"
            className="text-[#6b7280]"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            className="bg-[#111827] text-white hover:bg-[#111827]/90 min-w-[120px]"
            onClick={handleAdd}
            disabled={isUpdating || !newName || !newUrl}
          >
            {isUpdating ? <Loader className="mr-2" size={16} /> : <Plus className="mr-2 size-4" />}
            Add Endpoint
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

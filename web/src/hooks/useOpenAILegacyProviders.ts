import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import type {
  OpenAILegacyProviderInfo,
  AddOpenAILegacyProviderRequest,
  GlobalConfig,
} from "@/lib/api/models";

export type UseOpenAILegacyProvidersReturn = {
  providers: OpenAILegacyProviderInfo[];
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addProvider: (request: AddOpenAILegacyProviderRequest) => Promise<GlobalConfig>;
  deleteProvider: (name: string) => Promise<GlobalConfig>;
};

export function useOpenAILegacyProviders(): UseOpenAILegacyProvidersReturn {
  const [providers, setProviders] = useState<OpenAILegacyProviderInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await apiClient.config.listOpenAILegacyProvidersApiConfigProvidersOpenaiLegacyGet();
      setProviders(resp.providers);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load providers";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addProvider = useCallback(async (request: AddOpenAILegacyProviderRequest) => {
    setIsUpdating(true);
    setError(null);
    try {
      const config = await apiClient.config.addOpenAILegacyProviderApiConfigProvidersOpenaiLegacyPost({
        addOpenAILegacyProviderRequest: request
      });
      await refresh();
      return config;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add provider";
      setError(message);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [refresh]);

  const deleteProvider = useCallback(async (name: string) => {
    setIsUpdating(true);
    setError(null);
    try {
      const config = await apiClient.config.deleteOpenAILegacyProviderApiConfigProvidersOpenaiLegacyNameDelete({
        name
      });
      await refresh();
      return config;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete provider";
      setError(message);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    providers,
    isLoading,
    isUpdating,
    error,
    refresh,
    addProvider,
    deleteProvider,
  };
}

import { useMutation, useQueryClient } from "@tanstack/react-query";

import * as apiKey from "@/lib/api/api-key";

export function useApiKey() {
  const queryClient = useQueryClient();

  const createApiKeyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiKey.createApiKey();

      return res as unknown as { key: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    }
  });

  const revokeApiKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const res = await apiKey.revokeApiKey(keyId);

      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    }
  });

  return {
    createApiKey: createApiKeyMutation.mutateAsync,
    isCreatingApiKey: createApiKeyMutation.isPending,

    revokeApiKey: revokeApiKeyMutation.mutateAsync,
    isRevokingApiKey: revokeApiKeyMutation.isPending
  };
}

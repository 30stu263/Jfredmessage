import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { VirtualNumber } from "@shared/schema";

export function useVirtualNumbers() {
  const { data: virtualNumbers = [], isLoading } = useQuery<VirtualNumber[]>({
    queryKey: ["/api/virtual-numbers"],
  });

  const addVirtualNumberMutation = useMutation({
    mutationFn: async (data: { phoneNumber: string; purpose: string }) => {
      const res = await apiRequest("POST", "/api/virtual-numbers", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/virtual-numbers"] });
    },
  });

  const setDefaultNumberMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/virtual-numbers/${id}/set-default`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/virtual-numbers"] });
    },
  });

  // Find the active (default) number
  const activeNumber = virtualNumbers.find(number => number.isDefault);

  return {
    virtualNumbers,
    activeNumber,
    isLoading,
    addVirtualNumber: addVirtualNumberMutation.mutateAsync,
    setDefaultNumber: setDefaultNumberMutation.mutateAsync,
    isAddingNumber: addVirtualNumberMutation.isPending,
    isSettingDefault: setDefaultNumberMutation.isPending,
  };
}

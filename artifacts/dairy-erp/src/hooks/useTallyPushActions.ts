import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

function useInvalidatePushLog() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["tally-push-log"] });
}

/** AWAITING_APPROVAL -> PENDING. Requires APPROVE_BILLING permission (enforced by the RPC). */
export function useApproveTallyPush() {
  const invalidate = useInvalidatePushLog();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (pushLogId: number) => {
      const { error } = await supabase.rpc("approve_tally_push", { p_push_log_id: pushLogId });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Push approved" });
    },
    onError: (err: Error) => {
      toast({ title: "Could not approve push", description: err.message, variant: "destructive" });
    },
  });
}

/** FAILED -> PENDING, clears tally_response. Requires PUSH_TO_TALLY permission. */
export function useRetryFailedPush() {
  const invalidate = useInvalidatePushLog();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (pushLogId: number) => {
      const { error } = await supabase.rpc("retry_failed_push", { p_push_log_id: pushLogId });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Push queued for retry" });
    },
    onError: (err: Error) => {
      toast({ title: "Could not retry push", description: err.message, variant: "destructive" });
    },
  });
}

/** Only works on a SUCCESS original. Creates a new AWAITING_APPROVAL reversal row. Requires PUSH_TO_TALLY permission. */
export function useCreateReversalPush() {
  const invalidate = useInvalidatePushLog();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ originalPushId, reason }: { originalPushId: number; reason: string }) => {
      const { error } = await supabase.rpc("create_reversal_push", {
        p_original_push_id: originalPushId,
        p_reason: reason,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Reversal created", description: "Awaiting approval before it can be pushed." });
    },
    onError: (err: Error) => {
      toast({ title: "Could not create reversal", description: err.message, variant: "destructive" });
    },
  });
}

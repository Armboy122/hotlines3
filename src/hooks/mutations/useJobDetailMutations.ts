import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createJobDetail, updateJobDetail, deleteJobDetail } from '@/lib/actions/job-detail';
import type { CreateJobDetailData, UpdateJobDetailData } from '@/lib/actions/job-detail';
import { toast } from 'sonner';

// TODO: [EXTERNAL-API] อนาคต: แก้ไข hooks ให้เรียก External API แทน server actions

export function useCreateJobDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateJobDetailData) => {
      const result = await createJobDetail(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create job detail');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobDetails'] });
      toast.success('สร้างรายละเอียดงานสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

export function useUpdateJobDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateJobDetailData) => {
      const result = await updateJobDetail(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update job detail');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobDetails'] });
      toast.success('อัปเดตรายละเอียดงานสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

export function useDeleteJobDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteJobDetail(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete job detail');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobDetails'] });
      toast.success('ลบรายละเอียดงานสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

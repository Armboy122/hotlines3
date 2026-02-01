import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createJobType, updateJobType, deleteJobType } from '@/lib/actions/job-type';
import type { CreateJobTypeData, UpdateJobTypeData } from '@/lib/actions/job-type';
import { toast } from 'sonner';

// TODO: [EXTERNAL-API] อนาคต: แก้ไข hooks ให้เรียก External API แทน server actions

export function useCreateJobType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateJobTypeData) => {
      const result = await createJobType(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create job type');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobTypes'] });
      toast.success('สร้างประเภทงานสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

export function useUpdateJobType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateJobTypeData) => {
      const result = await updateJobType(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update job type');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobTypes'] });
      toast.success('อัปเดตประเภทงานสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

export function useDeleteJobType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteJobType(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete job type');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobTypes'] });
      toast.success('ลบประเภทงานสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

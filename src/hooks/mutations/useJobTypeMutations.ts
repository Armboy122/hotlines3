import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jobTypeService } from '@/lib/services/job-type.service';
import type { CreateJobTypeData, UpdateJobTypeData } from '@/lib/services/job-type.service';
import { toast } from 'sonner';

export function useCreateJobType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateJobTypeData) => jobTypeService.create(data),
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
    mutationFn: (data: UpdateJobTypeData) => jobTypeService.update(data),
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
    mutationFn: (id: string) => jobTypeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobTypes'] });
      toast.success('ลบประเภทงานสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

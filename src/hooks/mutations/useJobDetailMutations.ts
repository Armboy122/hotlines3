import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jobDetailService } from '@/lib/services/job-detail.service';
import type { CreateJobDetailData, UpdateJobDetailData } from '@/lib/services/job-detail.service';
import { toast } from 'sonner';

export function useCreateJobDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateJobDetailData) => jobDetailService.create(data),
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
    mutationFn: (data: UpdateJobDetailData) => jobDetailService.update(data),
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
    mutationFn: (id: string) => jobDetailService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobDetails'] });
      toast.success('ลบรายละเอียดงานสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskDailyService } from '@/lib/services/task-daily.service';
import type { CreateTaskDailyData, UpdateTaskDailyData } from '@/types/task-daily';
import { toast } from 'sonner';

export function useCreateTaskDaily() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskDailyData) => taskDailyService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskDailies'] });
      toast.success('สร้างงานประจำวันสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

export function useUpdateTaskDaily() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTaskDailyData) => taskDailyService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskDailies'] });
      toast.success('อัปเดตงานประจำวันสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

export function useDeleteTaskDaily() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskDailyService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskDailies'] });
      toast.success('ลบงานประจำวันสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

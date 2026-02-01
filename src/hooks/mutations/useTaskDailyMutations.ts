import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTaskDaily, updateTaskDaily, deleteTaskDaily } from '@/lib/actions/task-daily';
import type { CreateTaskDailyData, UpdateTaskDailyData } from '@/types/task-daily';
import { toast } from 'sonner';

// TODO: [EXTERNAL-API] อนาคต: แก้ไข hooks ให้เรียก External API แทน server actions

export function useCreateTaskDaily() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTaskDailyData) => {
      const result = await createTaskDaily(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create task daily');
      }
      return result.data;
    },
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
    mutationFn: async (data: UpdateTaskDailyData) => {
      const result = await updateTaskDaily(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update task daily');
      }
      return result.data;
    },
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
    mutationFn: async (id: string) => {
      const result = await deleteTaskDaily(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete task daily');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskDailies'] });
      toast.success('ลบงานประจำวันสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

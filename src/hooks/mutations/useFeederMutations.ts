import { useMutation, useQueryClient } from '@tanstack/react-query';
import { feederService } from '@/lib/services/feeder.service';
import type { CreateFeederData, UpdateFeederData } from '@/lib/services/feeder.service';
import { toast } from 'sonner';

export function useCreateFeeder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeederData) => feederService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeders'] });
      toast.success('สร้าง Feeder สำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

export function useUpdateFeeder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateFeederData) => feederService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeders'] });
      toast.success('อัปเดต Feeder สำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

export function useDeleteFeeder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => feederService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeders'] });
      toast.success('ลบ Feeder สำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

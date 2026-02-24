import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'status',
})
export class StatusPipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'Pending':
        return '🟡 Pending';
      case 'Shipped':
        return '🔵 Shipped';
      case 'Delivered':
        return '🟢 Delivered';
      default:
        return value;
    }
  }
}

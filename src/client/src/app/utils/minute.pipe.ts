import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'minute',
})
export class MinutePipe implements PipeTransform {
  transform(value: number, args?: any): any {
    return `${Math.floor(value / 60)}`;
  }
}

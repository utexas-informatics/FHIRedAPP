import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'second',
})
export class SecondPipe implements PipeTransform {
  transform(value: number, args?: any): any {
    return `${('0' + (value % 60)).slice(-2)}`;
  }
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'followUpDate'
})
export class FollowUpDatePipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): unknown {
    const values = value.split(',');
    return `${values?.[0]}${values?.[1].replace("Time:", "")}`;
  }

}

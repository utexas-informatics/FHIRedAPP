import {Injectable} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
 
@Injectable()
export class TabService { 
  
  private tabChangeSubject$ = new BehaviorSubject<string>(null);;

  constructor(){
   
  }

  get tabChange$(): Observable<String> {
    return this.tabChangeSubject$.asObservable();
  }

  setTabChange(tab: string): void {
    this.tabChangeSubject$.next(tab);
  }
}
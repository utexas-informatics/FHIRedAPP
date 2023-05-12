import { Component,Input, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'home-card',
  templateUrl: './home-card.component.html',
  styleUrls: ['./home-card.component.scss'],
})
export class HomeCardComponent implements OnInit, OnDestroy {
  
  @Input('props') props;
  constructor() {

  }

  ngOnInit() {

   }
 
  ngOnDestroy() {
    
  }
}

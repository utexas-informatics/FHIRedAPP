import { Component,Input, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'medication-capsule',
  templateUrl: './medication-capsule.component.html',
  styleUrls: ['./medication-capsule.component.scss'],
})
export class MedicationCapsuleComponent implements OnInit, OnDestroy {
  
  @Input('props') props;
  constructor() {

  }

  ngOnInit() {

   }

 
  ngOnDestroy() {
    
  }
}
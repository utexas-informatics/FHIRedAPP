import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-medical-record-list',
  templateUrl: './medical-records.component.html',
  styleUrls: ['./medical-records.component.scss'],
})
export class MedicalRecordListComponent implements OnInit, OnDestroy {
  @Input() medicalRecords = [];
  @Input() isExpanded = false;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {}

  ngOnDestroy() {}
}

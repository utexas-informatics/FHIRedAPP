import { Component,Input, OnDestroy, OnInit } from '@angular/core';
import { apiAssetsBaseUrl } from '../../utils/constants';

@Component({
  selector: 'home-myplugin-card',
  templateUrl: './home-myplugin-card.component.html',
  styleUrls: ['./home-myplugin-card.component.scss'],
})
export class HomeMypluginCardComponent implements OnInit, OnDestroy {
  
  @Input('props') props;
  readonly apiAssetsBaseUrl = apiAssetsBaseUrl;
  constructor() {

  }

  ngOnInit() {

   }

 
  ngOnDestroy() {
    
  }


}

import {
  Component,
  OnInit,
  ViewChild,
  EventEmitter,
  Output,
} from '@angular/core';
import { IonSlides } from '@ionic/angular';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
})
export class SliderComponent implements OnInit {
  // Optional parameters to pass to the swiper instance.
  // See http://idangero.us/swiper/api/ for valid options.
  @ViewChild('slides') ionSlides: IonSlides;
  @Output('slideEnd') slideEnd: EventEmitter<string> = new EventEmitter();

  slideOpts = {
    initialSlide: 0,
    autoplay: { delay: 6000 },
    loop: false,
    speed: 2000,
  };
  constructor() {}

  slideChanged() {
    this.slideEnd.emit('slideEnd');
  }
  slidePrevStart() {
    this.slideEnd.emit('slideStart');
  }

  ngOnInit() {}
}

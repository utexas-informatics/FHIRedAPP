import { Component, ElementRef, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { AppsService } from '../apps.service';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-ionic-open-app',
  templateUrl: './ionic-open-app.component.html',
  styleUrls: ['./ionic-open-app.component.scss'],
})
export class IonicOpenAppComponent implements OnInit {
  public url: string;
  public dataLoaded: boolean;
  public iframe: any;
  @ViewChild('iframeContainer') iframeContainer: ElementRef;
  constructor(
    private appsService: AppsService,
    private sanitizer: DomSanitizer
  ) {
    this.url = this.appsService.getURL();
    this.dataLoaded = false;
  }
  ngAfterViewInit(): void {
    this.injectIframe();
  }

  private injectIframe(): void {
    const container = this.iframeContainer.nativeElement;
    this.iframe = document.createElement('iframe');
    this.iframe.setAttribute('height', '100%');
    this.iframe.setAttribute('width', '100%');
    this.iframe.setAttribute('src', this.transform());
    this.iframe.setAttribute('id', 'iframe');
    this.iframe.setAttribute('frameBorder', '0');
    this.iframe.addEventListener('load', this.iframeOnLoadtwo.bind(this));
    container.appendChild(this.iframe);
  }

  public iframeOnLoadtwo(): void {
    this.dataLoaded = true;
  }

  ngOnInit() {}
  transform() {
    // return this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
    return this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(this.appsService.getURL()));
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { UserService } from 'src/app/profile/user.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  constructor(
    private router: Router,
    public popoverController: PopoverController,
    private userService: UserService
  ) {}

  ngOnInit() {}
  dismissPopover() {
    this.popoverController.dismiss();
  }
  redirectToProfile() {
    this.router.navigate(['tabs', 'profile']);
    this.dismissPopover();
  }

  logout() {
    // this.userService.logout();
    
    this.dismissPopover();
    this.userService.setLoggedOut(true);
    this.router.navigate(['/loginPassword']);
  }
}

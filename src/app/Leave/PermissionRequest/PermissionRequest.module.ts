import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PermissionRequestComponent } from './PermissionRequest.component';
import { FormsModule } from '@angular/forms';
import { PermissionRequestRoutingModule } from './PermissionRequest-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
// import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    PermissionRequestRoutingModule,
    // OwlDateTimeModule,
    // OwlNativeDateTimeModule,
  ],
  declarations: [
    PermissionRequestComponent
  ],
  providers: [
    DatePipe
  ]
})
export class PermissionRequestModule { }

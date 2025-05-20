import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth-guard.service';
// import { AdminapprovalComponent } from './adminapproval/adminapproval.component';
// import { BookRoomComponent } from './book-room/book-room.component';
// import { BookingPurposeComponent } from './booking-purpose/booking-purpose.component';
// import { ManagerapprovalComponent } from './managerapproval/managerapproval.component';
// import { MymeetingsComponent } from './mymeetings/mymeetings.component';

const routes: Routes = [
  // { path: '', component: AdminapprovalComponent, canActivate: [AuthGuard] },
  // { path: '', component: BookRoomComponent, canActivate: [AuthGuard] },
  // { path: '', component: BookingPurposeComponent, canActivate: [AuthGuard] },
  // { path: '', component: ManagerapprovalComponent, canActivate: [AuthGuard] },
  // { path: '', component: MymeetingsComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookmeetingroomRoutingModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth-guard.service';
import { WorkingCalendarComponent } from './WorkingCalendar.component';
const routes: Routes = [
  { path: '', component: WorkingCalendarComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkingCalendarRoutingModule { }

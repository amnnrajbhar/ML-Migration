import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth-guard.service';
import { UserIdsBulkUploadComponent } from './UserIdsBulkUpload.component';

const appRoute: Routes = [
  { path: '', component: UserIdsBulkUploadComponent, canActivate: [AuthGuard] },
];
@NgModule({
  imports: [
    RouterModule.forChild(appRoute)
  ],
  exports: [RouterModule]
})
export class UserIdsBulkUploadRoutingModule { }
 
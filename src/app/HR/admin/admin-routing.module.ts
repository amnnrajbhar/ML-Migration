import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { AuthGuard } from '../../auth/auth-guard.service';
import { MassEmailCommunicationComponent } from '../../HR/admin/mass-email-communication/mass-email-communication.component';
import { SendMassSmsComponent } from '../../HR/admin/send-mass-sms/send-mass-sms.component';
import { SmsRequestsListComponent } from '../../HR/admin/sms-requests-list/sms-requests-list.component';
import { EmailRequestsListComponent } from '../../HR/admin/email-requests-list/email-requests-list.component';

const routes: Routes = [

     { path: 'mass-email-communication', component: MassEmailCommunicationComponent, canActivate: [AuthGuard] },
     { path: 'send-mass-sms', component: SendMassSmsComponent, canActivate: [AuthGuard] },
     { path: 'sms-requests-list', component: SmsRequestsListComponent, canActivate: [AuthGuard] },
     { path: 'email-requests-list', component: EmailRequestsListComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }

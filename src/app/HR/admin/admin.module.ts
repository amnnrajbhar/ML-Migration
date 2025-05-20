import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { MassEmailCommunicationComponent } from './mass-email-communication/mass-email-communication.component';
import { HRSharedModule} from '../shared/hr-shared.module';
import {AdminRoutingModule} from '../admin/admin-routing.module';
import { AngularEditorModule} from '@kolkov/angular-editor';
import { SendMassSmsComponent } from '../../HR/admin/send-mass-sms/send-mass-sms.component';
import { SmsRequestsListComponent } from '../../HR/admin/sms-requests-list/sms-requests-list.component';
import { EmailRequestsListComponent } from '../../HR/admin/email-requests-list/email-requests-list.component';

@NgModule({
  imports: [
    CommonModule,    
    FormsModule,
    SharedmoduleModule,
    HRSharedModule,
    AdminRoutingModule,
    AngularEditorModule
  ],
  declarations: [
      MassEmailCommunicationComponent,
      SendMassSmsComponent,
      SmsRequestsListComponent,
      EmailRequestsListComponent
    ]
})
export class AdminModule { }

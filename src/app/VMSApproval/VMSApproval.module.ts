import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { WebcamModule } from 'ngx-webcam';

import { VMSApprovalComponent } from './VMSApproval.component';
import { VMSApprovalRoutingModule } from './VMSApproval-routing.module';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    WebcamModule,
    VMSApprovalRoutingModule
  ],
  declarations: [
    VMSApprovalComponent
  ]
})
export class VMSApprovalModule { }

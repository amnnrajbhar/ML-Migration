import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CabAdminapprovalComponent } from './cab-adminapproval.component';
import { CabAdminApprovalRoutingModule } from './cab-adminapproval-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    CabAdminApprovalRoutingModule
  ],
  declarations: [
    CabAdminapprovalComponent
  ]
})
export class CabAdminapprovalModule { }

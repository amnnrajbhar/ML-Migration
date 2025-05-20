import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractEmployeeApprovalComponent } from './ContractEmployeeApproval.component';
import { FormsModule } from '@angular/forms';
import { ContractEmployeeApprovalRoutingModule } from './ContractEmployeeApproval-routing.module';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    ContractEmployeeApprovalRoutingModule,
  ],
  declarations: [
    ContractEmployeeApprovalComponent
],
})
export class ContractEmployeeApprovalModule { }

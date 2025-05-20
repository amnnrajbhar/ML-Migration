import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractEmployeeListComponent } from './ContractEmployeeList.component';
import { FormsModule } from '@angular/forms';
import { ContractEmployeeListRoutingModule } from './ContractEmployeeList-routing.module';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    ContractEmployeeListRoutingModule,
  ],
  declarations: [
    ContractEmployeeListComponent
],
})
export class ContractEmployeeListModule { }

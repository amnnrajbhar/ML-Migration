import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractEmployeeComponent } from './ContractEmployee.component';
import { FormsModule } from '@angular/forms';
import { ContractEmployeeRoutingModule } from './ContractEmployee-routing.module';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    ContractEmployeeRoutingModule,
  ],
  declarations: [
    ContractEmployeeComponent
],
})
export class ContractEmployeeModule { }

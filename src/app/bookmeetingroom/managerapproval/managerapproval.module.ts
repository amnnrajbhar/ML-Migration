import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagerapprovalComponent } from './managerapproval.component';
import { ManagerapprovalRoutingModule } from './managerapproval-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    ManagerapprovalRoutingModule
  ],
  declarations: [
    ManagerapprovalComponent
  ]
})
export class ManagerapprovalModule { }

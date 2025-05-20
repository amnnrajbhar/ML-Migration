import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';
import { geoutothermatApprovalRoutingModule } from './geoutothermatApproval-routing.module';
import { geoutothermatApprovalComponent } from './geoutothermatApproval.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    geoutothermatApprovalRoutingModule
  ],
  declarations: [
    geoutothermatApprovalComponent
  ]
})
export class geoutothermatApprovalModule { }

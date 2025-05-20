import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminapprovalComponent } from './adminapproval.component';
import { AdminapprovalRoutingModule } from './adminapproval-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    AdminapprovalRoutingModule
  ],
  declarations: [
    AdminapprovalComponent
  ]
})
export class AdminapprovalModule { }

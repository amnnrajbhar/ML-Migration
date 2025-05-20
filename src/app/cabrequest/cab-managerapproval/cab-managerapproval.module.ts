import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CabManagerapprovalComponent } from './cab-managerapproval.component';
import { CabManagerapprovalRoutingModule } from './cab-managerapproval-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    CabManagerapprovalRoutingModule
  ],
  declarations: [
    CabManagerapprovalComponent
  ]
})
export class CabManagerapprovalModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyApprovalsComponent } from './MyApprovals.component';
import { FormsModule } from '@angular/forms';
import { MyApprovalsRoutingModule } from './MyApprovals-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    MyApprovalsRoutingModule,
  ],
  declarations: [
    MyApprovalsComponent
],
})
export class MyApprovalsModule { }

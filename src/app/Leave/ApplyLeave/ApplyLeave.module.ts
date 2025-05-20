import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplyLeaveComponent } from './ApplyLeave.component';
import { FormsModule } from '@angular/forms';
import { ApplyLeaveRoutingModule } from './ApplyLeave-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    ApplyLeaveRoutingModule,
  ],
  declarations: [
    ApplyLeaveComponent
],
})
export class ApplyLeaveModule { }

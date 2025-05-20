import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveCardComponent } from './LeaveCard.component';
import { FormsModule } from '@angular/forms';
import { LeaveCardRoutingModule } from './LeaveCard-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    LeaveCardRoutingModule,
  ],
  declarations: [
    LeaveCardComponent
],
})
export class LeaveCardModule { }

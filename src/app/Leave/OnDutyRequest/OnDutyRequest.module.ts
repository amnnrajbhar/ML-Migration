import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnDutyRequestComponent } from './OnDutyRequest.component';
import { FormsModule } from '@angular/forms';
import { OnDutyRequestRoutingModule } from './OnDutyRequest-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    OnDutyRequestRoutingModule,
  ],
  declarations: [
    OnDutyRequestComponent
],
})
export class OnDutyRequestModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverTimeRequestComponent } from './OverTimeRequest.component';
import { FormsModule } from '@angular/forms';
import { OverTimeRequestRoutingModule } from './OverTimeRequest-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    OverTimeRequestRoutingModule,
  ],
  declarations: [
    OverTimeRequestComponent
],
})
export class OverTimeRequestModule { }

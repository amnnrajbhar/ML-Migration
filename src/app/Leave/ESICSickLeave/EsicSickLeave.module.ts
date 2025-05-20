import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EsicSickLeaveComponent } from './EsicSickLeave.component';
import { FormsModule } from '@angular/forms';
import { EsicSickLeaveRoutingModule } from './EsicSickLeave-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    EsicSickLeaveRoutingModule,
  ],
  declarations: [
    EsicSickLeaveComponent
],
})
export class EsicSickLeaveModule { }

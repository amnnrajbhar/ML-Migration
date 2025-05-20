import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpShiftMasterComponent } from './EmpShiftMaster.component';
import { EmpShiftMasterRoutingModule } from './EmpShiftMaster-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    EmpShiftMasterRoutingModule
  ],
  declarations: [
    EmpShiftMasterComponent
  ],
  providers:[
    DatePipe
  ]
})
export class EmpShiftMasterModule { }

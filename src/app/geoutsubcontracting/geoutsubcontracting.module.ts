import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';
import { GEOutSubContractingComponent } from './geoutsubcontracting.component';
import { GEOutSubContractingRoutingModule } from './geoutsubcontracting-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    GEOutSubContractingRoutingModule
  ],
  declarations: [
    GEOutSubContractingComponent
  ]
})
export class GEOutSubContractingModule { }

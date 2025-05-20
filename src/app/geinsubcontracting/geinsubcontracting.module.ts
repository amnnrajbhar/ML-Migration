import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';
import { GEInSubContractingRoutingModule } from './geinsubcontracting-routing.module';
import { GEInSubContractingComponent } from './geinsubcontracting.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    GEInSubContractingRoutingModule
  ],
  declarations: [
    GEInSubContractingComponent
  ]
})
export class GEInSubContractingModule { }

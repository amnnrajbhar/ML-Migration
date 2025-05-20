import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';
import { GEInReturnableMatRoutingModule } from './geinreturnablemat-routing.module';
import { GEInReturnableMatComponent } from './geinreturnablemat.component';
import { GeinreturnablematdeptComponent } from './geinreturnablematdept/geinreturnablematdept.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    GEInReturnableMatRoutingModule
  ],
  declarations: [
    GEInReturnableMatComponent,
    GeinreturnablematdeptComponent
  ]
})
export class GEInReturnableMatModule { }

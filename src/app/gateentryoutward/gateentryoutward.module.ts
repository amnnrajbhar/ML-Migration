import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GateentryOutwardRoutingModule } from '../gateentryoutward/gateentryoutward-routing.module';
import { GateentryOutwardComponent } from './gateentryoutward.component';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    GateentryOutwardRoutingModule
  ],
  declarations: [
    GateentryOutwardComponent
  ]
})
export class GateentryOutwardModule { }

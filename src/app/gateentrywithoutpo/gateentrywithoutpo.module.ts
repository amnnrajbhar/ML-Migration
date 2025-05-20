import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';
import { GateentryWithoutPORoutingModule } from './gateentrywithoutpo-routing.module';
import { GateentryWithoutPOComponent } from './gateentrywithoutpo.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    GateentryWithoutPORoutingModule
  ],
  declarations: [
    GateentryWithoutPOComponent
  ]
})
export class GateentryWithoutPOModule { }

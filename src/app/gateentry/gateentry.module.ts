import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GateentryComponent } from './gateentry.component';
import { GateentryRoutingModule } from './gateentry-routing.module';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    GateentryRoutingModule
  ],
  declarations: [
    GateentryComponent
  ]
})
export class GateentryModule { }

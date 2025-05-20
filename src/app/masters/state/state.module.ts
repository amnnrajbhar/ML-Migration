import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateComponent } from './state.component';
import { StateRoutingModule } from './state-routing.moule';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    StateRoutingModule
  ],
  declarations: [
    StateComponent
  ]
})
export class StateModule { }

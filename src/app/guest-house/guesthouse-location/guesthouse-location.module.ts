import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GuesthouseLocationComponent } from './guesthouse-location.component';
import { GuesthouseLocationRoutingModule } from './guesthouse-location-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    GuesthouseLocationRoutingModule
  ],
  declarations: [
    GuesthouseLocationComponent
  ]
})
export class GuesthouseLocationModule { }

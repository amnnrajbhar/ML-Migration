import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
 import { RegularizationRequestComponent } from './RegularizationRequest.component';
import { RegularizationRequestRoutingModule } from './RegularizationRequest-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    RegularizationRequestRoutingModule
  ],
  declarations: [
     RegularizationRequestComponent
  ],
  providers:[
    DatePipe
  ]
})
export class RegularizationRequestModule { }

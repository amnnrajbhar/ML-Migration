import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShiftRegisterComponent } from './ShiftRegister.component';
import { ShiftRegisterRoutingModule } from './ShiftRegister-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    ShiftRegisterRoutingModule
  ],
  declarations: [
    ShiftRegisterComponent
  ],
  providers:[
    DatePipe
  ]
})
export class ShiftRegisterModule { }

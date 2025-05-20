import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AdditionandAttritionComponent } from './AdditionandAttrition.component';
import { FormsModule } from '@angular/forms';
import { AdditionandAttritionRoutingModule } from './AdditionandAttrition-routing.module';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    AdditionandAttritionRoutingModule,
  ],
  declarations: [
    AdditionandAttritionComponent
],
providers:[
  DatePipe
]
})
export class AdditionandAttritionModule { }

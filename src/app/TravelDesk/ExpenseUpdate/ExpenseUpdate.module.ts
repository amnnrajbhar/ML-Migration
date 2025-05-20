import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
 import { ExpenseUpdateComponent } from './ExpenseUpdate.component';
import { ExpenseUpdateRoutingModule } from './ExpenseUpdate-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    ExpenseUpdateRoutingModule
  ],
  declarations: [
     ExpenseUpdateComponent
  ],
  providers:[
    DatePipe
  ]
})
export class ExpenseUpdateModule { }

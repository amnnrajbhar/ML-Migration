import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChecklistRoutingModule } from './checklist-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { ListComponent } from './list/list.component';

@NgModule({
  imports: [
    CommonModule,    
    FormsModule,
    SharedmoduleModule,
    ChecklistRoutingModule
  ],
  declarations: [
    ListComponent
  ],
  exports: [    
  ]
})
export class ChecklistModule { }

import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ManualEntryComponent } from './ManualEntry.component';
import { FormsModule } from '@angular/forms';
import { ManualEntryRoutingModule } from './ManualEntry-routing.module';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    ManualEntryRoutingModule,
  ],
  declarations: [
    ManualEntryComponent
],
providers:[
  DatePipe
]
})
export class ManualEntryModule { }

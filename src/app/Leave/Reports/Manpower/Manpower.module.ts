import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ManpowerComponent } from './Manpower.component';
import { FormsModule } from '@angular/forms';
import { ManpowerRoutingModule } from './Manpower-routing.module';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    ManpowerRoutingModule,
  ],
  declarations: [
    ManpowerComponent
],
providers:[
  DatePipe
]
})
export class ManpowerModule { }

import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';
import { JobWorkRoutingModule } from './jobwork-routing.module';
import { JobWorkComponent } from './jobwork.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    JobWorkRoutingModule
  ],
  declarations: [
    JobWorkComponent
  ],
  providers:[
    DatePipe,
    DecimalPipe
  ]
})
export class JobWorkModule { }

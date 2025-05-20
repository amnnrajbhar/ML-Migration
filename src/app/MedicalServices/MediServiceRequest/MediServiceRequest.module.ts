import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { MediServiceRequestRoutingModule } from './MediServiceRequest-routing.module';
import { MediServiceRequestComponent } from './MediServiceRequest.component';
import { MatProgressBarModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    MediServiceRequestRoutingModule,
    MatProgressBarModule
  ],
  declarations: [MediServiceRequestComponent],
  providers:[
    DatePipe,
  ]
})
export class MediServiceRequestModule { }

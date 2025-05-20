import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { DLSSubstituteRoutingModule } from './DLSSubstitute-routing.module';
import { DLSSubstituteComponent } from './DLSSubstitute.component';

@NgModule({
  imports: [
    CommonModule,   
    
    FormsModule,
    SharedmoduleModule,
    DLSSubstituteRoutingModule
  ],
  declarations: [DLSSubstituteComponent],
  providers:[DatePipe]
})
export class DLSSubstituteModule { }

import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { DLSTransReportsRoutingModule } from './DLSTransReports-routing.module';
import { DLSTransReportsComponent } from './DLSTransReports.component';

@NgModule({
  imports: [
    CommonModule,   
    
    FormsModule,
    SharedmoduleModule,
    DLSTransReportsRoutingModule
  ],
  declarations: [DLSTransReportsComponent],
  providers:[DatePipe]
})
export class DLSTransReportsModule { }

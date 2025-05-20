import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { DLSReportsRoutingModule } from './DLSReports-routing.module';
import { DLSReportsComponent } from './DLSReports.component';

@NgModule({
  imports: [
    CommonModule,   
    
    FormsModule,
    SharedmoduleModule,
    DLSReportsRoutingModule
  ],
  declarations: [DLSReportsComponent],
  providers:[DatePipe]
})
export class DLSReportsModule { }

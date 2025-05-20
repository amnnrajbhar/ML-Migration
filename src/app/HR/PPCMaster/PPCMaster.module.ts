import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { PPCMasterComponent } from './PPCMaster.component';
import { PPCMasterRoutingModule } from './PPCMaster-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    PPCMasterRoutingModule
  ],
  declarations: [
    PPCMasterComponent
  ],
  providers:[
    DatePipe
  ]
})
export class PPCMasterModule { }

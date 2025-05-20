import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { SoftwareModulesComponent } from './SoftwareModules.component';
import { SoftwareModulesRoutingModule } from './SoftwareModules-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    SoftwareModulesRoutingModule
  ],
  declarations: [
    SoftwareModulesComponent
  ]
})
export class SoftwareModulesMasterModule { }

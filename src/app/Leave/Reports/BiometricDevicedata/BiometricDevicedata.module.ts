import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BiometricDevicedataComponent } from './BiometricDevicedata.component';
import { FormsModule } from '@angular/forms';
import { BiometricDevicedataRoutingModule } from './BiometricDevicedata-routing.module';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    BiometricDevicedataRoutingModule,
  ],
  declarations: [
    BiometricDevicedataComponent
],
providers:[
  DatePipe
]
})
export class BiometricDevicedataModule { }

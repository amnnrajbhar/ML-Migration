import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { WebcamModule } from 'ngx-webcam';

import { ViewAMCDetailsComponent } from './ViewAMCDetails.component';
import { ViewAMCDetailsRoutingModule } from './ViewAMCDetails-routing.module';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    WebcamModule,
    ViewAMCDetailsRoutingModule
  ],
  declarations: [
    ViewAMCDetailsComponent
  ]
})
export class ViewAMCDetailsModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { WebcamModule } from 'ngx-webcam';

import { UpdateAMCDetailsComponent } from './UpdateAMCDetails.component';
import { UpdateAMCDetailsRoutingModule } from './UpdateAMCDetails-routing.module';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    WebcamModule,
    UpdateAMCDetailsRoutingModule
  ],
  declarations: [
    UpdateAMCDetailsComponent
  ]
})
export class UpdateAMCDetailsModule { }

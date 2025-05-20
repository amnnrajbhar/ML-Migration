import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { WebcamModule } from 'ngx-webcam';

import { VisitorentryComponent } from './visitorentry.component';
import { VisitorentryRoutingModule } from './visitorentry-routing.module';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    WebcamModule,
    VisitorentryRoutingModule
  ],
  declarations: [
    VisitorentryComponent
  ]
})
export class VisitorentryModule { }

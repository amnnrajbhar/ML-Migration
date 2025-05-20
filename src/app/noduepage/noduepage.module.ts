import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoduepageComponent } from './noduepage.component';
import { NoduepageRoutingModule } from './noduepage-routing.module';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    NoduepageRoutingModule
  ],
  declarations: [
    NoduepageComponent
  ]
})
export class NoduepageModule { }
